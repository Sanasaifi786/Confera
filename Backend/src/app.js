import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import {connectToSocket} from "./controllers/socketManager.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/userRoute.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

dotenv.config({
    path:"./.env"
});
// app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

app.use("/api/v1/user",userRoute);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

connectDB()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Server failed to start:", error.message);
        process.exit(1);
    });
