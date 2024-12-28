import { Button, Box, TextField } from "@mui/material";
import Card from "../components/Card";
import {useState, useEffect} from 'react';
import SideNav from "../components/SideNav";


interface Message{
    sender: string;
    text: string;
    timeStamp: {type: Date};
}

const ChatView = () => {

    const [data, setData] = useState<Message[] | null>(null);
    const [inputText, setInputText] = useState<string>(""); 
    const [flag, setFlag] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>("");

    
    useEffect(() => {
        const fetchData = async () => {
            try{
                // NEED TO SET RECEIVER AND SENDER HERE
                const response = await fetch(`http://localhost:3000/getAllMessages`);
                const result: Message[] = await response.json();
                console.log("getAllmessages", result);
                setData(result);
//                const name =  localStorage.getItem("userName");
//                localStorage.clear();
                setUserData(localStorage.getItem("userName"));
            }
            catch(error){
                console.error(error);
            }
        }

        fetchData();
   }, [flag])

   const handleText = async () => {
       const obj = {
           sender: localStorage.getItem("userName"),
           text: inputText
        }
        try{

            const response = await fetch(`http://localhost:3000/createMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj)
            });
            if(!response.ok){
                console.log("Error while creating new record");
            }

            const result = await response.json();
            setFlag(!flag);
            console.log(result);
        }
        catch(error){
            console.error(error);
        }
            
   }


    return (
        <Box >
        <h1>Chat View</h1>
        <SideNav />
        <Box gap={2} sx={{ display: "flex", flexDirection: "column" }}>

        {
            data && data.map((item, index) => {
                return <Box key={index} sx={{display: "flex", justifyContent: item.sender === userData ? "flex-end" : "flex-start"}}> 
                {item.text && <Card sender= {item.sender} text= {item.text} timeStamp={item.timeStamp} />}
                </Box>
            }) 

            }
            <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch'} }}
      noValidate
      autoComplete="off"
    >
    </Box>
        </Box>
              <TextField id="outlined-basic" label="Outlined" variant="outlined" value={inputText} onChange={(e) => {setInputText(e.target.value)}} />
    <Button onClick={handleText}>Push me</Button>

                </Box>

    )
}

export default ChatView;