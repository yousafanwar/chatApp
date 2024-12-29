import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"] // Custom error message
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, // Ensures no duplicate emails
        match: [/.+\@.+\..+/, "Please use a valid email address"] // Regex validation for email format
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    },
    myContacts: { 
        type: Array, 
        default: [] // Default value if not provided
    }
});

const user = new mongoose.model('user', userSchema);

export default user;