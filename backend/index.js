import express, { query } from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import message from './db/schemas/message.js';
import user from './db/schemas/user.js';
import { Server } from "socket.io";
import http from 'http';
import { login, registerUser, authenticate } from './services/Auth.js'

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true,
    },
});


io.on('connection', (socket) => {
    console.log('User has been connected', socket.id);

    socket.on('message', async (data) => {
        const { sender, receiver, text } = data;
        const newMessage = new message({ sender, receiver, text });
        await newMessage.save();
        io.emit('message', newMessage);
    })

    socket.on('fetchChat', async (data) => {
        const { sender, receiver } = data;
        const chats = await message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ timeStamp: 1 });

        io.emit('chatHistory', chats);

    });
    socket.on('disconnect', () => {
        console.log('user disconneted');
    })
})

app.post('/login', login);

app.post('/registerUser', registerUser);
// app.post('/registerUser', async (req, res) => {
//     const { name, email, password } = req.body;
//     const newUser = new user({ name, email, password });
//     newUser.save();
//     res.send(200);
// })

app.get('/getAllUsers/:loggesInUser', authenticate, async (req, res) => {
    const { loggesInUser } = req.params;
    const response = await user.find({ _id: { $ne: loggesInUser } }).select("_id name email");
    res.json(response);
})

// add a contact to the myContacts
app.post('/addToMyContacts', authenticate, async (req, res) => {
    const { loggedInUserId, _id, email, name } = req.body;
    try {
        await user.updateOne({ _id: loggedInUserId }, { $push: { myContacts: { _id, email, name } } });
        res.status(200).json({ response: "Record created successfully" });
    }
    catch (error) {
        res.send(error);
    }
})

// get myContacts
app.get('/getMyContacts/:_id', authenticate, async (req, res) => {
    const { _id } = req.params;
    try {
        const response = await user.findOne({ _id });
        const result = response.myContacts;
        res.json(result);
    }
    catch (error) {
        res.send(error);
    }
})

server.listen(3000, function (req, res) {
    console.log("app is listing on 3000");
})