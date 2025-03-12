import * as React from 'react';
import { Box, Drawer, Button, List, Divider, ListItem, ListItemButton, Backdrop, CircularProgress, ListItemText, Typography, Avatar, ButtonBase, Dialog, useTheme, useMediaQuery, TextField, Checkbox, Alert } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckIcon from '@mui/icons-material/Check';
import { useState, useEffect } from 'react';
import ProfileView from '../views/ProfileView';

interface IContact {
    _id: string,
    name: string,
    email: string,
    avatar: string,
    members: Array<string>,
    adminId: string
}

const SideNav = (props: any) => {

    const theme = useTheme();
    const mobileScreenView = useMediaQuery(theme.breakpoints.down('sm'));

    const drawerWidth = 340;
    const [userData, setUserData] = useState<any>(null);
    const [contacts, setContacts] = useState<IContact[]>([]);
    const [openAddContact, setOpenAddContact] = useState<boolean>(false);
    const [myContactList, setMyContactList] = useState<IContact[]>([]);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [showBackdrop, setShowBackdrop] = useState<boolean>(false);
    const [openGroupDialog, setOpenGroupDialog] = useState<boolean>(false);
    const [groupName, setGroupName] = useState<string>("");
    const [selectedGroupItem, setSelectedGroupItem] = useState<any[]>([]);
    const [groupCreationSuccess, setGroupCreationSuccess] = useState<boolean>(false);
    const [src, setSrc] = useState<any>(null);


    useEffect(() => {
        const loggedInUserData = JSON.parse(localStorage.getItem("userData") || "{}");
        setUserData(loggedInUserData);
        setSrc(loggedInUserData.avatar ? loggedInUserData.avatar.toString() : "");

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

    useEffect(() => {

        // const fetch = async () => {
        //     try{
        //         await Promise.all([
        //              renderMyContactList(),
        //              renderAllGroups() 
        //             ])
        //     }finally{
        //     }
        // };

        //        fetch();
        renderAllGroups();

    }, [userData, showBackdrop])

    const handleLogOut = () => {
        console.log("log out clicked");
        localStorage.clear();
        window.location.href = '/login';
    }

    const handleClose = () => {
        setShowBackdrop(false);
    }

    const closeGroupDialog = () => {
        setOpenGroupDialog(false);
    }

    const handleGroup = async () => {

        const groupObj = {
            name: groupName,
            members: selectedGroupItem,
            adminId: userData._id
        }

        try {
            const response = await fetch("http://localhost:3000/createGroup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(groupObj)
            })
            if (!response.ok) {
                throw new Error("Error while creating new group");
            } else {
                console.log("create new group response", response);
                setGroupCreationSuccess(true);
            }
        } catch (error) {
            console.error("Error", error);
        }
    }

    const renderAllGroups = async () => {
        if (userData) {
            const response = await fetch(`http://localhost:3000/getGroups/${userData._id}`);
            const result = await response.json();
            console.log("groups", result);
            await renderMyContactList();

            setMyContactList((prevState) => [...prevState, ...result.map((groupItem: IContact) => ({
                groupId: groupItem._id,
                name: groupItem.name,
                email: groupItem.email,
                avatar: groupItem.avatar,
                members: groupItem.members,
                adminId: groupItem.adminId,
            }))]);
        }
    }

    useEffect(() => {
        const fetchUpdatedUserData = async () => {
            if (userData) {
                const response = await fetch(`http://localhost:3000/getUpdatedUser/${userData._id}`);
                const result = await response.json();
                setSrc(result.avatar ? result.avatar.toString() : "")
            }
        }

        fetchUpdatedUserData();
    }, [userData])



    return (
        <Drawer sx={{
            width: mobileScreenView ? "100%" : drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: mobileScreenView ? "100%" : drawerWidth,
                boxSizing: 'border-box',
            },
        }}
            variant="permanent"
            anchor="left"
            open={true}>
            <Box sx={{ width: "100%" }} role="application">
                <Button onClick={getContacts}>Add new contacts</Button>
                {openAddContact && <List key={contacts.length}>
                    {contacts && Array.isArray(contacts) && contacts.map((item, index) => (
                        <>
                            <ListItem key={index} disablePadding>
                                <ListItemButton>
                                    <Avatar src={item.avatar ? item.avatar.toString() : ""} alt='avatar' />
                                    <ListItemText primary={item.name} onClick={() => handleContactClick(item)} />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                        </>
                    ))}
                    <Button onClick={() => setOpenAddContact(false)}>Close</Button>
                </List>}
                <Divider />
                <Button onClick={() => { setOpenGroupDialog(true) }}>Create a new Group</Button>
                <Dialog open={openGroupDialog} onClose={closeGroupDialog}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '80vh' }}>
                        <TextField variant='filled' label="Group name" value={groupName} onChange={(e) => { setGroupName(e.target.value) }} />
                        <Typography>Add members</Typography>
                        <List key={myContactList.length}>
                            {myContactList && Array.isArray(myContactList) && myContactList.map((item, index) => {
                                return <>
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton>
                                            <Avatar src={item.avatar ? item.avatar.toString() : ""} alt='user avatar' />
                                            {/* <ListItemText primary={item.name} onClick={() => handleGroup(item, index)} /> */}
                                            <ListItemText primary={item.name} onClick={() => setSelectedGroupItem((prevState: any) => selectedGroupItem.includes(item._id) ? selectedGroupItem.filter((i: any) => { return i !== item._id }) : [...prevState, item._id])} />
                                            {selectedGroupItem && selectedGroupItem.includes(item._id) && <CheckBoxIcon />}
                                        </ListItemButton>
                                    </ListItem>
                                    <Divider />
                                </>
                            })
                            }
                            <Button onClick={handleGroup}>Create group</Button>
                            {groupCreationSuccess && <><Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                                Group created sucessfuly.
                            </Alert>
                                <Button onClick={() => { setOpenGroupDialog(false) }}>Continue</Button>
                            </>
                            }
                        </List>
                    </Box>
                </Dialog>
                {showBackdrop && <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={showBackdrop}
                    onClick={handleClose}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>}
                <List key={myContactList.length}>
                    {myContactList && Array.isArray(myContactList) && myContactList.map((item, index) => {
                        return <>
                            <ListItem key={index} disablePadding>
                                <ListItemButton>
                                    <Avatar src={item.avatar ? item.avatar.toString() : ""} alt='user avatar' />
                                    <ListItemText primary={item.name} onClick={() => props.sendData(item)} />
                                    {/* <ListItemText primary={item.name} onClick={() => localStorage.setItem("selectedContact", JSON.stringify(item))} /> */}
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                        </>
                    })
                    }
                </List>
            </Box>
            <Dialog open={showProfile}>
                <CancelIcon onClick={() => { setShowProfile(false) }} sx={{ cursor: "pointer", position: "fixed" }} />
                <ProfileView />
            </Dialog>
            {userData && <><ButtonBase onClick={() => { setShowProfile(true) }}>
                <Avatar alt="User avatar" src={src} sx={{ width: 150, height: 150 }} />
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