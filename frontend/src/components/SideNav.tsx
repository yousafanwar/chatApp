import * as React from 'react';
import { Box, Drawer, Button, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { useState, useEffect } from 'react';

interface Contacts {
    _id: String,
    name: String,
    email: String
}

const SideNav = (props: any) => {

    const drawerWidth = 240;
    const [userData, setUserData] = useState<any>(null);
    const [contacts, setContacts] = useState<Contacts[] | null>(null);
    const [openAddContact, setOpenAddContact] = useState<boolean>(false);
    const [myContactList, setMyContactList] = useState<Contacts[] | null>(null);

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem("userData") || "{}"));
        
    }, [contacts])

    const getContacts = async () => {

        if (userData)
            try {
                const response = await fetch(`http://localhost:3000/getAllUsers/${userData._id}`);
                const result: Contacts[] = await response.json();
                setContacts(result);
                setOpenAddContact(true)
            } catch (error) {
                console.error(error);
            }
    };


    const handleContactClick = async (e: any) => {
        const obj = {
            loggedInUserId: userData._id,
            _id: e._id,
            email: e.email,
            name: e.name
        }
        console.log("Clicked list item", e);
        try {
            const response = await fetch("http://localhost:3000/addToMyContacts", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                console.log("Error while updating contact list");
            }

            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const renderMyContactList = async () => {
            if (userData) {
                try {
                    const response = await fetch(`http://localhost:3000/getMyContacts/${userData._id}`);
                    const result = await response.json();
                    setMyContactList(result);
                    // localStorage.setItem('myContacts', JSON.stringify(result));
                }
                catch (error) {
                    console.error(error);
                }
            }
        };
    
        renderMyContactList();
    }, [userData])





    return (
        <Drawer sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
            },
        }}
            variant="persistent"
            anchor="left"
            open={true}>
            <Box sx={{ width: 250 }} role="application">
                <Button onClick={getContacts}>Add new contacts</Button>
                {openAddContact && <List>
                    {contacts && <Typography>Hello! {userData.name}</Typography>}
                    {contacts && contacts.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={item.name} onClick={() => handleContactClick(item)} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Button onClick={() => setOpenAddContact(false)}>Close</Button>
                </List>}
                <Divider />
                {myContactList && myContactList.map((item, index) => {

                    return <List key={index}>
                        <ListItem  disablePadding>
                            <ListItemButton>
                                <ListItemIcon>
                                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                                </ListItemIcon>
                                <ListItemText primary={item.name} onClick={() => props.sendData(item)} />
                                {/* <ListItemText primary={item.name} onClick={() => localStorage.setItem("selectedContact", JSON.stringify(item))} /> */}
                            </ListItemButton>
                        </ListItem>
                    </List>

                })

                }
            </Box>
        </Drawer>
    )
}

export default SideNav;