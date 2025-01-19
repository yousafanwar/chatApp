import { Button, Box, TextField, Typography, Dialog } from "@mui/material";
import Card from "../components/Card";
import { useState, useEffect } from 'react';
import SideNav from "../components/SideNav";
import { io } from "socket.io-client";
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';

interface Message {
    sender: string;
    text: string;
    blob: any;
    blobType: string;
    timeStamp: { type: Date };
}

interface IRetrievedChats {
    _id: string;
    sender: string;
    receiver: string;
    text: string;
    timeStamp: string;
    blobFetchedFromDb: any;
    blobType: string;
}

const server = io("http://localhost:3000/");
const ChatView = () => {

    const [data, setData] = useState<IRetrievedChats[] | []>([]);
    const [inputText, setInputText] = useState<string>("");
    const [userData, setUserData] = useState<any>(null);
    const [selectedContactData, setSelectedContactData] = useState<any>("");
    const [receiverSrc, setReceiverSrc] = useState<string>("");
    const [attachmentSrc, setAttachmentSrc] = useState<any>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [mediaBlob, setmediaBlob] = useState<any>(null); // to be sent to backend

    useEffect(() => {

        const loggedInUser = JSON.parse(localStorage.getItem("userData") || "{}");

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
        const handleChatHistory = (chatHistory: IRetrievedChats[]) => {
            setData(chatHistory);
        };
        server.on('chatHistory', handleChatHistory);
        return () => {
            server.off('chatHistory', handleChatHistory);
        };

    }, [selectedContactData])

    useEffect(() => {
        const readNewMessage = (newMessage: any) => {
            console.log("readNewMessage", newMessage);
            setData((preState) => [...preState, newMessage]);
        }
        server.on('message', readNewMessage);
        return () => {
            server.off('message');
        };
    }, []);

    const handleText = () => {
        console.log(inputText, mediaBlob);
        if (mediaBlob) {
            server.emit('message', { sender: userData._id, receiver: selectedContactData._id, text: inputText, blob: mediaBlob, blobType: mediaBlob.type });
            setmediaBlob(null);
        } else {
            server.emit('message', { sender: userData._id, receiver: selectedContactData._id, text: inputText });
        }
        setInputText("");
        setOpenDialog(false);
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

    useEffect(() => {
        const fetchSecondUser = async () => {
            try {
                if (selectedContactData) {
                    const response = await fetch(`http://localhost:3000/getIndUser/${selectedContactData._id}`)
                    const result = await response.json();
                    setReceiverSrc(result);

                }
            } catch (error: any) {
                throw new Error(error);
            }
        }

        fetchSecondUser();
    }, [selectedContactData])

    const handleUpload = (e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
            setmediaBlob(blob);

            const url = URL.createObjectURL(blob);
            setOpenDialog(true);
            setAttachmentSrc(url);

        }
        reader.readAsArrayBuffer(file);
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
                                    {item.text && <Card src={receiverSrc} sender={item.sender} text={item.text} timeStamp={item.timeStamp} blob={item.blobFetchedFromDb} blobType={item.blobType} />}
                                </Box>
                            })
                        }
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "200px", marginTop: "20px" }}>
                        <TextField fullWidth placeholder="Enter text" variant="outlined" value={inputText} onChange={(e) => { setInputText(e.target.value) }} />
                        <label htmlFor="fileUpload" style={{ margin: "1px", cursor: "pointer" }}>
                            <AddIcon />
                        </label>
                        <input id="fileUpload" type="file" onChange={(e) => { handleUpload(e) }} style={{ display: "none" }} />
                        <Button sx={{ ":hover": { backgroundColor: "black", color: "white" } }} onClick={handleText}><SendIcon /></Button>
                    </Box>
                    <Dialog open={openDialog} onClose={() => { setOpenDialog(false) }}>
                        <img src={attachmentSrc} alt="attachment" style={{ width: "500px", height: "auto" }} />
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "200px", marginTop: "20px" }}>
                            <TextField fullWidth placeholder="Enter text" variant="outlined" value={inputText} onChange={(e) => { setInputText(e.target.value) }} />
                            <Button sx={{ ":hover": { backgroundColor: "black", color: "white" } }} onClick={handleText}><SendIcon /></Button>
                        </Box>
                    </Dialog>
                </>}
        </Box>
    )
}

export default ChatView;