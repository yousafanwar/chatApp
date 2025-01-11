import { Button, Box, TextField, Typography } from "@mui/material";
import Card from "../components/Card";
import { useState, useEffect } from 'react';
import SideNav from "../components/SideNav";
import { io } from "socket.io-client";
import SendIcon from '@mui/icons-material/Send';

interface Message {
    sender: string;
    text: string;
    timeStamp: { type: Date };
}

const server = io("http://localhost:3000/");
const ChatView = () => {

    const [data, setData] = useState<Message[] | []>([]);
    const [inputText, setInputText] = useState<string>("");
    const [userData, setUserData] = useState<any>(null);
    const [selectedContactData, setSelectedContactData] = useState<any>("");

    useEffect(() => {

        const loggedInUser = JSON.parse(localStorage.getItem("userData") || "{}");
        console.log("user data from local storage", loggedInUser);

        if (!userData) {
            setUserData(loggedInUser);
        }

        if (!loggedInUser.token) {
            window.location.href = '/login';
        }
    }, [selectedContactData])

    useEffect(() => {
        if (!userData || !selectedContactData) return;
        server.emit('fetchChat', { sender: userData._id, receiver: selectedContactData._id });
        console.log("fetchChat has been triggered");
        const handleChatHistory = (chatHistory: Message[]) => {
            console.log("chatHistory", chatHistory);
            setData(chatHistory);
        };
        server.on('chatHistory', handleChatHistory);
        return () => {
            server.off('chatHistory', handleChatHistory);
        };

    }, [selectedContactData])

    useEffect(() => {
        const readNewMessage = (newMessage: any) => {

            setData((preState) => [...preState, newMessage]);
        }

        server.on('message', readNewMessage);

        setInputText("");

        return () => {
            server.off('message');
        };
    }, []);

    const handleText = () => {
        server.emit('message', { sender: userData._id, receiver: selectedContactData._id, text: inputText });
        setInputText("");
    }

    const fetchDataFromChild = (childData: any) => {
        setSelectedContactData(childData);
    }

    const renderWelcomeMessage = () => {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <Typography variant="h1">Welcome to the chatapp</Typography>
            </Box>
        )
    }

    return (
        <Box>
            <Box sx={{ width: "250px", borderRight: "1px solid #ccc" }}>
                <SideNav sendData={fetchDataFromChild} />
            </Box>
            {!selectedContactData ? renderWelcomeMessage() :
                <>
                    <Typography variant="h1">Chat View</Typography>
                    {selectedContactData && <Typography>Chat between {userData.name} & {selectedContactData.name}</Typography>}
                    <Box gap={2} sx={{ display: "flex", flexDirection: "column", marginLeft: "200px" }}>

                        {
                            data && data.map((item, index) => {
                                return <Box key={index} sx={{ display: "flex", justifyContent: item.sender === userData._id ? "flex-end" : "flex-start" }}>
                                    {item.text && <Card src={item.avatar} sender={item.sender} text={item.text} timeStamp={item.timeStamp} />}
                                </Box>
                            })
                        }
                    </Box>
                    <Box sx={{ display: "flex", marginLeft: "200px", marginTop: "20px" }}>
                        <TextField fullWidth placeholder="Enter text" variant="outlined" value={inputText} onChange={(e) => { setInputText(e.target.value) }} />
                        <Button sx={{ ":hover": { backgroundColor: "black", color: "white" } }} onClick={handleText}><SendIcon /></Button>
                    </Box>
                </>}
        </Box>
    )
}

export default ChatView;