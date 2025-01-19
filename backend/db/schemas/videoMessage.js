import mongoose from 'mongoose';

const videoMessage = new mongoose.Schema({
    originalMessageId: String,
    dbBlob: Buffer
})

const videoAttachments = new mongoose.model("videoAttachments", videoMessage);

export default videoAttachments;