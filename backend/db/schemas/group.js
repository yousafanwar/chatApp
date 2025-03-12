import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    adminId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    timeStamp: { type: Date, default: Date.now }
});

const group = new mongoose.model("group", groupSchema);

export default group;