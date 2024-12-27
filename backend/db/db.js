import mongoose from 'mongoose';
import message from './schemas/message.js';


const connectToDb = async () => {
    try{
        await mongoose.connect("mongodb://localhost/TestDb"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        console.log("Db has been connected");
    }catch(error){
        console.error(error);
    }
};

connectToDb();

export default mongoose;