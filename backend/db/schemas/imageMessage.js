import mongoose from 'mongoose';

const imageMessage = new mongoose.Schema({
    originalMessageId: String,
    dbBlob: Buffer
})

const imageAttachments = new mongoose.model("imageAttachments", imageMessage);

export default imageAttachments;