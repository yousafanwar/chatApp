import { useState, useEffect } from 'react';
import { Button, Box, TextField, Dialog, Alert } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const RegisterUserView = () => {
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [successFlag, setSuccessFlag] = useState<boolean>(false);
    const navigate = useNavigate();

    const registerUser = async () => {
        try {
            const response = await fetch("http://localhost:3000/registerUser", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });
            if (!response.ok) {
                console.log("Error while login");
            }

            const result = await response.json();
            console.log("register user data", result);
            setSuccessFlag(true);
            setName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Box gap={2} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "90px" }}>
            <TextField fullWidth label="Name" value={name} onChange={(e) => { setName(e.target.value) }} />
            <TextField fullWidth label="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
            <TextField fullWidth label="Password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
            <Button disabled={successFlag} fullWidth onClick={registerUser}>Register</Button>
            {successFlag && <>
                <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                    congratulations! You have registered successfully
                </Alert>
                <Button fullWidth onClick={() => { navigate('/login') }}>Go to login</Button>

            </>}
        </Box>
    )
}

export default RegisterUserView;