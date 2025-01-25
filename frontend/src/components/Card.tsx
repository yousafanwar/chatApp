import { Box, Stack, Backdrop, CircularProgress, Avatar, Typography } from "@mui/material";
import '../styles/ChatView.css';
import { useState, useEffect } from 'react';

const Card = (props: any) => {
    const [userData, setUserData] = useState<any>("");
    const [attachmentSrc, setAttachmentSrc] = useState<string>("");
    const [renderMedia, setRenderMedia] = useState<boolean>(false);
    const [renderBackDrop, setRenderBackDrop] = useState<boolean>(false);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(loggedInUser);
    }, [])

    useEffect(() => {
        try{
            setRenderBackDrop(true);
            if (props.blob) {
                const blob = new Blob([props.blob]);
                const url = URL.createObjectURL(blob);
                console.log("card image url", url)
                setAttachmentSrc(url);
                setRenderMedia(true);
            }
        }finally{
            setRenderBackDrop(false);
        }
       


    }, [props.blob])

    return (
        <Box>
            <Stack direction="column" spacing={1} sx={{ backgroundColor: props.sender === userData._id ? "lightgreen" : 'lightblue', borderRadius: '10px' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Backdrop
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                color: '#fff',
                                zIndex: 1,
                            }}
                            open={renderBackDrop}
                            onClick={() => {setRenderBackDrop(false)}}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    

                    {renderMedia && props.blobType && props.blobType.includes("image") && <img src={attachmentSrc} alt="image" style={{ width: "200px", height: "auto", borderRadius: "5px" }} onLoad={() => {setRenderBackDrop(false)}} />}

                    {renderMedia && props.blobType && props.blobType.includes("video") && <video width="320" height="240" controls style={{ borderRadius: "5px" }}>
                        <source src={attachmentSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", }}>
                    <Avatar sx={{ width: 25, height: 25 }} src={props.sender === userData._id ? userData.avatar : props.src.avatar} alt="User avatar" />
                    <Typography sx={{ padding: "5px" }}>{props.text}</Typography>
                </Box>
            </Stack>

        </Box>
    )
}

export default Card;