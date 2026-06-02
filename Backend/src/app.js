import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import {connectToSocket} from "./controllers/socketManager.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
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

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Server failed to start:", error.message);
        process.exit(1);
    });
