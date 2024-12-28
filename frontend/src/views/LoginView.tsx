import {useState, useEffect} from 'react';
import { Button, Box, TextField, InputLabel  } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const LoginView = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try{
            const response = await fetch("http://localhost:3000/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password})
            });
            if(!response.ok){
                console.log("Error while login");
            }

            const result = await response.json();
            localStorage.setItem('userData', JSON.stringify(result.getUser));
            console.log("login user data", result);
            navigate('/');
//            console.log(result.getUser.name);
        }catch(error){
            console.error(error);
        }

    }

    return(
        <Box>
            <TextField label="Email" value={email} onChange={(e) => {setEmail(e.target.value)}}/>
            <TextField label="Password" value={password} onChange={(e) => {setPassword(e.target.value)}}/>
            <Button onClick={handleLogin}>Login</Button>
        </Box>
    )
}

export default LoginView;