import express, { query } from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import message from './db/schemas/message.js';
import user from './db/schemas/user.js';

const app = express();
app.use(express.json()); 
app.use(cors());

app.post('/login', async(req, res) => {
    const {email, password} = req.body;
    const getUser = await user.findOne({email, password});
    res.json({getUser});
})

app.post('/registerUser', async(req, res) => {
    const {name, email, password} = req.body;
    const newUser = new user({name, email, password});
    newUser.save();
    res.send(200);
})

app.get('/getAllUsers/:loggesInUser', async(req, res) => {
    const {loggesInUser} = req.params;
    const response = await user.find({_id: {$ne: loggesInUser}}).select("_id name email");
    res.json(response);
})

app.get('/getAllMessages', async (req, res) => {
    const {sender, receiver} = req.params;
    const chats = await message.find({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      }).sort({ timeStamp: 1 });
    res.json(chats);
})

// add a contact to the myContacts
app.post('/addToMyContacts', async(req, res) => {
    const {_id, email, name} = req.body; 
    try{
        const updatedUser = user.updateOne({_id}, {$push: {myContacts: {_id, email, name}}});
        updatedUser.save();
        res.sendStatus(200);
    }
    catch(error){
        res.send(error);
    }
})

app.post('/createMessage', async (req, res) => {
    const {sender, receiver, text} = req.body;
    const newMessage = new message({sender, receiver, text});
    await newMessage.save();
    res.status(200).json({response: "Record created successfully"});
})



app.listen(3000, function(req, res){
    console.log("app is listing on 3000");
})