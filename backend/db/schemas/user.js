import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    myContacts: Array
})

const user = new mongoose.model('user', userSchema);

export default user;