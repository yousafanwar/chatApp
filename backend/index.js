import express, { query } from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import message from './db/schemas/message.js';
import user from './db/schemas/user.js';
import group from './db/schemas/group.js';
import { Server } from "socket.io";
import http from 'http';
import { login, registerUser, authenticate } from './services/Auth.js'
import bodyParser from 'body-parser';
import imageAttachments from './db/schemas/imageMessage.js';
import videoAttachments from './db/schemas/videoMessage.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
        const { sender, receiver, text, blob, blobType, groupId } = data;
        const newMessage = new message({ sender, receiver, text, groupId });
        const imageResource = blob && blobType.includes("image") && new imageAttachments({ originalMessageId: newMessage._id, dbBlob: blob });
        const videoResource = blob && blobType.includes("video") && new videoAttachments({ originalMessageId: newMessage._id, dbBlob: blob });
        await Promise.all([
            newMessage.save(),
            blob && blobType.includes("image") && imageResource.save(),
            blob && blobType.includes("video") && videoResource.save()
        ])

        const obj = {
            id: newMessage._id,
            sender: newMessage.sender,
            receiver: newMessage.receiver,
            text: newMessage.text,
            timeStamp: newMessage.timeStamp,
            blobFetchedFromDb: blob,
            groupId: newMessage.groupId,
            blobType
        }
        io.emit('message', obj);
    })

    socket.on('fetchChat', async (data) => {
        let { sender, receiver, groupId } = data;
        let blobFetchedFromDb = null;
        let blobType = "";
        let chats = [];

        if (groupId) {
            chats = await message.find({ groupId });
        } else {
            chats = await message.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender },
                ],
                groupId: null
            }).sort({ timeStamp: 1 });
        }

        const retrievedChats = await Promise.all(
            chats.map(async (item) => {
                const chatImages = await imageAttachments.find({ originalMessageId: item._id });
                const chatVideos = await videoAttachments.find({ originalMessageId: item._id });
                const senderAvatar = await user.findById(sender, 'name email avatar');
                if (chatImages.length > 0) {
                    blobFetchedFromDb = chatImages[0].dbBlob;
                    blobType = "image";
                }
                if (chatVideos.length > 0) {
                    blobFetchedFromDb = chatVideos[0].dbBlob;
                    blobType = "video";
                }

                const obj = {
                    _id: item._id,
                    sender: item.sender,
                    receiver: item.receiver ? item.receiver : null,
                    text: item.text,
                    timeStamp: item.timeStamp,
                    blobFetchedFromDb,
                    groupId: item.groupId ? item.groupId : null,
                    blobType,
                    senderAvatar
                }
                blobFetchedFromDb = null;
                blobType = null;

                return obj;
            })
        );
        io.emit('chatHistory', retrievedChats);

    });
    socket.on('disconnect', () => {
        console.log('user disconneted');
    })
})

app.post('/login', login);

app.post('/registerUser', registerUser);

app.post('/createGroup', async (req, res) => {
    const { name, members, adminId } = req.body;
    try {
        const newGroup = new group({ name, members, adminId });
        newGroup.save();
        res.status(200).send('Group Created successfully')
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
})

app.get('/getGroups/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const response = await group.find({ $or: [{ members: id }, { adminId: id }] });
        res.status(200).send(response);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }

})

app.put('/updateGroup', async (req, res) => {
    const { newMember, groupId } = req.body;

    try {
        let updatedGroup = await group.findByIdAndUpdate(groupId, { $push: { members: newMember } }, { new: true });
        if (!updatedGroup) {
            res.status(400).send('Could not find the group');
        } else {
            res.status(200).send('group members updated successfully', updatedGroup);
        }
    }
    catch (error) {
        res.status(500).send('internal server error');
    }
})

app.put('/updateUser/:id', async (req, res) => {
    const id = req.params.id;

    const { image } = req.body;
    const response = await user.updateOne({ _id: id }, { $set: { avatar: image } });
    res.json(response);

});

app.get('/getAllUsers/:loggesInUser', authenticate, async (req, res) => {
    const { loggesInUser } = req.params;
    const response = await user.find({ _id: { $ne: loggesInUser } }).select("_id name email avatar");
    res.json(response);
})

// add a contact to the myContacts
app.post('/addToMyContacts', authenticate, async (req, res) => {
    const { loggedInUserId, _id, email, name } = req.body;
    try {
        await user.updateOne({ _id: loggedInUserId }, { $push: { myContacts: _id } });
        res.status(200).json({ response: "Record created successfully" });
    }
    catch (error) {
        res.status(500).send(error);
    }
})

// gets every individual of a group
app.post('/getIndUser', async (req, res) => {
    try {
        const { memberIds, adminId } = req.body;
        const [chatMemberIds, chatAdminId] = await Promise.all([
            Promise.all(
                memberIds.map(id => user.findById(id, 'name email avatar'))
            ),
            user.findById(adminId, 'name email avatar')
        ]);
        const responseObj = { groupMembers: chatMemberIds, groupAdmin: chatAdminId };
        res.status(200).json(responseObj);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
})

// this method is being used to get the updated user profile picture
app.get('/getUpdatedUser/:_id', async (req, res) => {
    const id = req.params._id;
    try {
        const response = await user.findOne({ _id: id }).select('name, email, avatar');
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send("Internal server error");
    }

})

// get myContacts
app.get('/getMyContacts/:_id', authenticate, async (req, res) => {
    const { _id } = req.params;
    try {
        const response = await user.findOne({ _id });
        const myContactsIds = response.myContacts;
        let userContacts = await Promise.all(myContactsIds.map(async (ele) => {
            return await user.findOne({ _id: ele });
        }))
        res.json(userContacts);
    }
    catch (error) {
        res.status(500).send(error);
    }
})

server.listen(3000, function (req, res) {
    console.log("app is listing on 3000");
})