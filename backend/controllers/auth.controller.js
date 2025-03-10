import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username});

    if (existingUser) {      
      return res.status(400).json({ error: "Username is already taken" });
    }

    const exsitingEmail = await User.findOne({ email });

    if (exsitingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if(password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: passwordHash,
    });

    if(newUser) {
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        res.status(201).json({ 
            _id: newUser._id,
            fullName: newUser.fullName, 
            username: newUser.username,
            email: newUser.email,
            followers: newUser.followers,
            following: newUser.following,
            profilePicture: newUser.profilePicture,
            coverPicture: newUser.coverPicture,
         });
    }else {
        res.status(400).json({ error: "Invalid user data" });
    }

  } catch (error) {
    console.error("Error in signup: ", error.message);

    res.status(500).json({ error: "Internal server Error" });
  }
}

export const login = async (req, res) => { 
    try{ 

        const { username, password } = req.body;
        const user = await User.findOne({ username }); 
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({ 
            _id: user._id,
            fullName: user.fullName, 
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profilePicture: user.profilePicture,
            coverPicture: user.coverPicture,
        }); 

    }catch(error) {
        console.error("Error in login: ", error.message);

        res.status(500).json({ error: "Internal server Error" });
    }
}

export const logout = async (req, res) => { 
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({ message: "Logout successfully" });  
    }catch(error) {
        console.error("Error in logout: ", error.message);

        res.status(500).json({ error: "Internal server Error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user); 
    }catch(error) {
        console.error("Error in getMe: ", error.message);

        res.status(500).json({ error: "Internal server Error" });
    }
}