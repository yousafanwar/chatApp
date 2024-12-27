import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
    sender: String,
    text: String,
    timeStamp: {type: Date, default: Date.now}
});

const message = new mongoose.model("message", messageSchema);

export default message;