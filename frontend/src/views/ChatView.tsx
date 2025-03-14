import { Button, Box, TextField, Typography, Dialog, AppBar, Avatar } from "@mui/material";
import Card from "../components/Card";
import { useState, useEffect } from 'react';
import SideNav from "../components/SideNav";
import { io } from "socket.io-client";
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';

interface IRetrievedChats {
    _id: string;
    sender: string;
    receiver: Array<string>;
    text: string;
    timeStamp: string;
    blobFetchedFromDb: any;
    blobType: string;
    senderAvatar: any;
}

const server = io("http://localhost:3000/");
const ChatView = () => {

    const [data, setData] = useState<IRetrievedChats[] | []>([]);
    const [inputText, setInputText] = useState<string>("");
    const [userData, setUserData] = useState<any>(null);
    const [selectedContactData, setSelectedContactData] = useState<any>("");
    const [receiverSrc, setReceiverSrc] = useState<any>("");
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
        if (!selectedContactData.groupId) {
            server.emit('fetchChat', { sender: userData._id, receiver: selectedContactData._id });
        } else {
            server.emit('fetchChat', { sender: userData._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId });
        }
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
            setData((preState) => [...preState, newMessage]);
        }
        server.on('message', readNewMessage);
        return () => {
            server.off('message');
        };
    }, []);

    const handleText = () => {
        if (mediaBlob) {
            if (!selectedContactData.groupId) {
                server.emit('message', { sender: userData._id, receiver: selectedContactData._id, text: inputText, blob: mediaBlob, blobType: mediaBlob.type });
            } else {
                server.emit('message', { sender: userData._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText, blob: mediaBlob, blobType: mediaBlob.type });
            }

            setmediaBlob(null);
        } else {
            if (!selectedContactData.groupId) {
                server.emit('message', { sender: userData._id, receiver: selectedContactData._id, text: inputText });
            } else {
                server.emit('message', { sender: userData._id, receiver: selectedContactData.members, groupId: selectedContactData.groupId, text: inputText });
            }
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

    const getChatMembers = async () => {
        try {
            if (selectedContactData) {
                const obj = {
                    memberIds: selectedContactData.members,
                    adminId: selectedContactData.adminId[0],
                    groupId: selectedContactData.groupId
                }
                const response = await fetch(`http://localhost:3000/getIndUser`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(obj)
                })
                const result = await response.json();
                setReceiverSrc(result.groupMembers);
            }
        } catch (error: any) {
            throw new Error(error);
        }
    }

    const fetchSecondUser = async (userId: string) => {
        try {
            if (userId) {
                const response = await fetch(`http://localhost:3000/getUpdatedUser/${userId}`)
                const result = await response.json();
                console.log('getSecondUser result', result);
                setReceiverSrc(result);
            }
        } catch (error: any) {
            throw new Error(error);
        }
    }
    useEffect(() => {
        console.log("selectedContactData", selectedContactData);


        if (selectedContactData.adminId) {
            getChatMembers();
        } else {
            fetchSecondUser(selectedContactData._id);
        }

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
            console.log("uploaded media url: ", url);

        }
        reader.readAsArrayBuffer(file);
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box>
                <SideNav sendData={fetchDataFromChild} />
            </Box>
            <Box marginLeft={30}>
                {!selectedContactData ? renderWelcomeMessage() :
                    <>
                        <AppBar sx={{ width: "78%" }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, marginLeft: "22px" }}>
                                <Avatar src={receiverSrc.avatar} alt="avatar" />
                                <Typography variant="h6">
                                    {selectedContactData.name}
                                </Typography>
                            </Box>
                        </AppBar>
                        <Box sx={{ height: "80vh", overflow: "hidden", overflowY: "scroll" }}>
                            {
                                data && data.map((item, index) => {
                                    return <Box key={index} sx={{ display: "flex", justifyContent: item.sender === userData._id ? "flex-end" : "flex-start", margin: "10px" }}>
                                        {item.text && <Card src={item.senderAvatar} sender={item.sender} text={item.text} timeStamp={item.timeStamp} blob={item.blobFetchedFromDb} blobType={item.blobType} />}
                                    </Box>
                                })
                            }
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <TextField fullWidth placeholder="Enter text" variant="outlined" value={inputText} onChange={(e) => { setInputText(e.target.value) }} />
                            <label htmlFor="fileUpload" style={{ margin: "1px", cursor: "pointer" }}>
                                <AddIcon />
                            </label>
                            <input id="fileUpload" type="file" onChange={(e) => { handleUpload(e) }} style={{ display: "none" }} />
                            <Button sx={{ ":hover": { backgroundColor: "black", color: "white" } }} onClick={handleText}><SendIcon /></Button>
                        </Box>
                        <Dialog open={openDialog} onClose={() => { setOpenDialog(false) }} sx={{ backdropFilter: "blur(14px)" }}>
                            {mediaBlob && mediaBlob.type.includes("image") && <img src={attachmentSrc} alt="attachment" style={{ width: "500px", height: "auto" }} />}
                            {mediaBlob && mediaBlob.type.includes("video") && <video width="320" height="240" controls style={{ borderRadius: "5px" }}>
                                <source src={attachmentSrc} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>}
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <TextField fullWidth placeholder="Enter text" variant="outlined" value={inputText} onChange={(e) => { setInputText(e.target.value) }} />
                                <Button sx={{ ":hover": { backgroundColor: "black", color: "white" } }} onClick={handleText}><SendIcon /></Button>
                            </Box>
                        </Dialog>
                    </>}
            </Box>
        </Box>

    )
}

export default ChatView;