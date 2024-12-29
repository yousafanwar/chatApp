import jwt from 'jsonwebtoken';
import user from '../db/schemas/user.js';
import bcrypt from 'bcrypt';


const privateKey = "secret";

const saltRounds = 10;

export const authenticate = async (req, res, next) => {
    try{

        const authHeaders = req.headers.authorization;
        console.log("authHeaders:", authHeaders);
    
        const token = authHeaders && authHeaders.split(" ")[1];
        console.log("token:", token);
    
        if(!token){
            throw new Error("Token not provided");
        }
        
        jwt.verify(token, privateKey, function(err, decoded) {
            if(err){
                throw new Error(err);
            }else{
                next();
            }
          });
    }
    catch(error){
        console.log("Authentication failed:", error);
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUser = await user.findOne({ email });
        console.log(findUser);
        if (!findUser) {
            res.status(401).json({ "error message": "Incorrect email" })
        }

        bcrypt.compare(password, findUser.password, function (err, result) {
            if (!result) {
                res.status(401).send("Wrong password");
            } else {
                jwt.sign(email, privateKey, function (err, token) {
                    if (err) {
                        throw new Error(err);
                    }
                    if (token) {
                        const userData = {
                            _id: findUser._id,
                            email: findUser.email,
                            name: findUser.name,
                            token
                        }
                        console.log(userData);
                        res.json({ userData });
                    }

                });
            }
        });

    }
    catch (error) {
        console.log("Error while logingin in:", error);
    }
}

export const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        bcrypt.hash(password, saltRounds, async function (err, hash) {
            const newUser = new user({ name, email, password: hash });
            await newUser.save();
            res.status(200).json("New user registered");

            if (err) {
                console.error(err);
            }
        });

    } catch (error) {
        res.status(400).json("Error while creating new user");
    }

}




