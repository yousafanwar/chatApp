import express from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import message from './db/schemas/message.js';

const app = express();
app.use(express.json()); 
app.use(cors());


app.get('/getAllMessages', async (req, res) => {
    const getMessages = await message.find();
    res.json(getMessages);
})

app.post('/createMessage', async (req, res) => {
    const {sender, text} = req.body;
    const newMessage = new message({sender, text});
    await newMessage.save();
    res.send(200).json({response: "Record created successfully"});
})



app.listen(3000, function(req, res){
    console.log("app is listing on 3000");
})