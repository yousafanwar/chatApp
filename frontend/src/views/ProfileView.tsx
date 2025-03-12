import { Alert, Button, Box, Typography, Avatar } from "@mui/material";
import { useState, useEffect } from 'react';

const ProfileView = () => {

    const [userData, setUserData] = useState<any>(null);
    const [src, setSrc] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState<boolean>(false);

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(loggedInUser);
        if (loggedInUser.avatar) {
            setSrc(loggedInUser.avatar.toString());
        }

    }, [])

    const handleImageUpload = (e: any) => {

        const reader = new FileReader();

        const files = e.target.files[0];

        reader.readAsDataURL(files);

        reader.onload = () => {
            setSrc(reader.result);
        }

    }
    const updateUser = async () => {
        try {

            const response = await fetch(`http://localhost:3000/updateUser/${userData._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: src })
            })

            if (!response.ok) {
                console.log("User update failed");
            }
            const result = await response.json();
            console.log(result);
            if (result.modifiedCount > 0) {
                setSuccessMessage(true);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "500px", height: "100vh" }}>

            <Typography variant="h1" sx={{ display: "flex", justifyContent: "center" }}>Profile</Typography>
            <Box sx={{ border: "solid black", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <label htmlFor="fileSelector">
                    <Avatar sx={{ width: "100px", height: "100px", cursor: "pointer" }} alt="User avatar" src={src} />
                </label>
                <input id="fileSelector" type="file" style={{ display: "none" }} onChange={(e) => { handleImageUpload(e) }}></input>
            </Box>
            {successMessage && <Alert>Profile updated successfully</Alert>}
            <Button onClick={updateUser}>Update</Button>

        </Box>
    )
}

export default ProfileView;