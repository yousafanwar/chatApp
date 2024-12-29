import { useState, useEffect } from 'react';
import { Button, Box, TextField, Dialog, Alert } from "@mui/material";
import CheckIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

const LoginView = () => {

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [successFlag, setSuccessFlag] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) {
                setSuccessFlag(true);
                console.log("front end Error while login");
                return
            }

            const result = await response.json();
            localStorage.setItem('userData', JSON.stringify(result.userData));
            console.log("login user data", result);
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" }}>
            <Box gap={2} sx={{ display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.08)", padding: "30px", borderRadius: "5px" }}>
                <TextField label="Email" value={email} onChange={(e) => { setEmail(e.target.value) }} />
                <TextField label="Password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                {successFlag && <>
                    <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                        Incorrect email or password
                    </Alert>
                </>}
                <Button fullWidth onClick={handleLogin}>Login</Button>
                <Button onClick={() => { navigate('/register'); }}>Register now</Button>
            </Box>
        </Box>
    )
}

export default LoginView;