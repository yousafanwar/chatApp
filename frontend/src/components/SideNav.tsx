import * as React from 'react';
import { Box, Drawer, Button, List, Divider, ListItem, ListItemButton, Backdrop, CircularProgress, ListItemText, Typography, Avatar, ButtonBase, Dialog } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState, useEffect } from 'react';
import ProfileView from '../views/ProfileView';

interface IContact {
    _id: String,
    name: String,
    email: String,
    avatar: String
}

const SideNav = (props: any) => {

    const drawerWidth = 240;
    const [userData, setUserData] = useState<any>(null);
    const [contacts, setContacts] = useState<IContact[]>([]);
    const [openAddContact, setOpenAddContact] = useState<boolean>(false);
    const [myContactList, setMyContactList] = useState<IContact[]>([]);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [showBackdrop, setShowBackdrop] = useState<boolean>(false);

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem("userData") || "{}"));

    }, [])

    const getContacts = async () => {

        if (userData)
            try {
                const response = await fetch(`http://localhost:3000/getAllUsers/${userData._id}`, {
                    headers: {
                        authorization: `Bearer ${userData.token}`
                    }
                });
                const result: IContact[] = await response.json();

                const myContactIds = myContactList.map((item) => {
                    return item._id;
                })

                const filteredResult = result.filter((item) => {
                    return !myContactIds.includes(item._id);
                })

                setContacts(filteredResult);
                setOpenAddContact(true)
            } catch (error) {
                console.error(error);
            }
    };


    const handleContactClick = async (e: any) => {
        setShowBackdrop(true);
        const obj = {
            loggedInUserId: userData._id,
            _id: e._id,
        }
        try {
            const response = await fetch("http://localhost:3000/addToMyContacts", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${userData.token}`
                },
                body: JSON.stringify(obj)
            });
            if (!response.ok) {
                console.log("Error while updating contact list");
            }

        } catch (error) {
            console.error(error);
        }

        finally {
            setShowBackdrop(false);
        }
    }

    useEffect(() => {
        const renderMyContactList = async () => {
            if (userData) {
                try {
                    const response = await fetch(`http://localhost:3000/getMyContacts/${userData._id}`, {
                        headers: {
                            authorization: `Bearer ${userData.token}`
                        }
                    });
                    if (!response.ok) {
                        alert("You are not authenticated, please login again");
                        window.location.href = '/login';
                    }
                    const result = await response.json();
                    setMyContactList(result);
                }
                catch (error) {
                    console.error(error);
                }
            }
        };

        renderMyContactList();
    }, [userData, showBackdrop])

    const handleLogOut = () => {
        console.log("log out clicked");
        localStorage.clear();
        window.location.href = '/login';
    }

    const handleClose = () => {
        setShowBackdrop(false);
    }

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
                {openAddContact && <List key={contacts.length}>
                    {contacts && Array.isArray(contacts) && contacts.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <Avatar src={item.avatar ? item.avatar.toString() : ""} alt='avatar' />
                                <ListItemText primary={item.name} onClick={() => handleContactClick(item)} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Button onClick={() => setOpenAddContact(false)}>Close</Button>
                </List>}
                <Divider />
                {showBackdrop && <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={showBackdrop}
                    onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>}
                <List key={myContactList.length}>
                    {myContactList && Array.isArray(myContactList) && myContactList.map((item, index) => {
                        return <ListItem key={index} disablePadding>
                            <ListItemButton>
                                <Avatar src={item.avatar ? item.avatar.toString() : ""} alt='user avatar' />
                                <ListItemText primary={item.name} onClick={() => props.sendData(item)} />
                                {/* <ListItemText primary={item.name} onClick={() => localStorage.setItem("selectedContact", JSON.stringify(item))} /> */}
                            </ListItemButton>
                        </ListItem>
                    })
                    }
                </List>
            </Box>
            <Dialog open={showProfile}>
                <CancelIcon onClick={() => { setShowProfile(false) }} sx={{ cursor: "pointer", position: "fixed" }} />
                <ProfileView />
            </Dialog>
            {userData && <><ButtonBase onClick={() => { setShowProfile(true) }}>
                <Avatar alt="User avatar" src={userData.avatar ? userData.avatar.toString() : ""} sx={{ width: 150, height: 150 }} />
            </ButtonBase >
                <Typography>Hi {userData.name}</Typography></>
            }
            <ButtonBase >
                <LogoutIcon onClick={handleLogOut} />
            </ButtonBase>

        </Drawer>
    )
}

export default SideNav;