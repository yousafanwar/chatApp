import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Button, Box, TextField } from "@mui/material";
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
                <Chip label={props.text} variant={props.sender === userData._id ? "filled" : "outlined"} sx={{ margin: 3 }} />
            </Stack>
        </>
    )
}

export default Card;