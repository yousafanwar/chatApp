import * as React from 'react';
import {Box, Drawer, Button, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import {useState, useEffect} from 'react';

interface Contacts{
    _id: String,
    name: String,
    email: String
}

const SideNav = () => {

    const drawerWidth = 240;
    const [userData, setUserData] = useState<any>(null);
    const [contacts, setContacts] = useState<Contacts[] | null>(null);

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem("userData") || "{}"));
    }, [])    

    const getContacts = async () => {
            
        if(userData)
        try{
            const response = await fetch(`http://localhost:3000/getAllUsers/${userData._id}`);
            const result : Contacts[] = await response.json();
            setContacts(result); 
        }catch(error){
            console.error(error);
        }
    };


    const handleContactClick = async (e: any) => {
        console.log("Clicked list item", e);
        try{
            const response = await fetch("http://localhost:3000/addToMyContacts", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(e)
            });
            if(!response.ok){
                console.log("Error while updating contact list");
            }

            const result = await response.json();
            console.log(result);
        }catch(error){
            console.error(error);
        }

    }



    return(
        <Drawer         sx={{
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
          <List>
            {contacts && <Typography>Add Contact</Typography>}
        {contacts && contacts.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={item.name} onClick={() => handleContactClick(item)}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Box>
      </Drawer>
    )
}

export default SideNav;