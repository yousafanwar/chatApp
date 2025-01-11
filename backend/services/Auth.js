import jwt from 'jsonwebtoken';
import user from '../db/schemas/user.js';
import bcrypt from 'bcrypt';


const privateKey = "secret";

const saltRounds = 10;

export const authenticate = async (req, res, next) => {
    try {

        const authHeaders = req.headers.authorization;
        const token = authHeaders && authHeaders.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token not provided" });
        }

        jwt.verify(token, privateKey, function (err, decoded) {
            if (err) {
                return res.status(403).json({ error: "Token verification failed" });
            } else {
                next();
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUser = await user.findOne({ email });
        console.log(findUser);
        if (!findUser) {
            res.status(401).json({ error: "Incorrect email" })
        }

        await bcrypt.compare(password, findUser.password, function (err, result) {
            if (!result) {
                res.status(401).json({ error: "Wrong password" });
            } else {
                jwt.sign({ email }, privateKey, { expiresIn: '1h' }, function (err, token) {
                    if (err) {
                        throw new Error(err);
                    }
                    if (token) {
                        const userData = {
                            _id: findUser._id,
                            email: findUser.email,
                            name: findUser.name,
                            avatar: findUser.avatar,
                            token
                        }
                        res.json({ userData });
                    }
                });
            }
        });
    }
    catch (error) {
        console.log("Error while logingin in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        await bcrypt.hash(password, saltRounds, async function (err, hash) {
            const newUser = new user({ name, email, password: hash });
            await newUser.save();
            res.status(200).json({ message: "New user registered" });

            if (err) {
                console.error("password hash error:", err);
            }
        });

    } catch (error) {
        res.status(400).json("Error while creating new user");
    }

}




