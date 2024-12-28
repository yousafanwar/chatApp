import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Button, Box, TextField } from "@mui/material";
import '../styles/ChatView.css';
import {useState, useEffect} from 'react';


const Card = (props: any) => {
    const [userData, setUserData] = useState<any>("");
    useEffect(() => {
            setUserData(localStorage.getItem("userName"));
        
    }, [])

    return(
        <>

  <Stack  direction="row" spacing={1}>
      <Chip label={props.text} variant={props.sender === userData ? "filled" : "outlined"} sx={{display: "flex", justifyContent: props.sender === userData ? "flex-start" : "flex-end", margin: 3}}/>
    </Stack>

    {/* {props.sender} */}

        {/* <p>{props.timeStamp}</p> */}
        </>
    )
}

export default Card;