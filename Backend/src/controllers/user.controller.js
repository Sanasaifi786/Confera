import httpStatus from 'http-status';
import { User } from '../models/user.model.js';
import { Meeting } from '../models/meeting.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "Username already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, password: hashedPassword });
        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString('hex');
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({
                message: "Login successful",
                token: token,
                user: { name: user.name, username: user.username }
            });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message });
    }
}

// Save a meeting to the user's activity history
const addToActivity = async (req, res) => {
    const { token, meeting_id } = req.body;
    if (!token || !meeting_id) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token and meeting_id are required" });
    }
    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        const newMeeting = new Meeting({
            user_id: user._id.toString(),
            meeting_id: meeting_id,
            date: new Date()
        });
        await newMeeting.save();
        return res.status(httpStatus.CREATED).json({ message: "Meeting saved to activity" });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message });
    }
}

// Get all past meetings for a user
const getAllActivities = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Token is required" });
    }
    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }
        const meetings = await Meeting.find({ user_id: user._id.toString() }).sort({ date: -1 });
        return res.status(httpStatus.OK).json({ meetings });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message });
    }
}

export { register, login, addToActivity, getAllActivities };