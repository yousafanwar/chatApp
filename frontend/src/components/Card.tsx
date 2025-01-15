import { Stack, Chip, Avatar } from "@mui/material";
import '../styles/ChatView.css';
import { useState, useEffect } from 'react';

const Card = (props: any) => {
    const [userData, setUserData] = useState<any>("");
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(loggedInUser);
    }, [])

    return (
        <>
            <Stack direction="row" spacing={1}>
                <Chip avatar={<Avatar sx={{ width: 150, height: 150 }} src={props.sender === userData._id ? userData.avatar : props.src.avatar} alt="User avatar" />} label={props.text} variant={props.sender === userData._id ? "filled" : "outlined"} sx={{
                    margin: 3, height: 'auto',
                    '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        maxWidth: '50vw'
                    },
                }}
                    size='medium' />
            </Stack>
        </>
    )
}

export default Card;