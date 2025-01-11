import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please use a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    myContacts: {
        type: Array,
        default: []
    },
    avatar: {
        type: String
    },
    media: {
        type: {
            type: String,
        },
        url: String,
        name: String,
        size: Number
    },
    timeStamp: { type: Date, default: Date.now }
});

const user = new mongoose.model('user', userSchema);

export default user;