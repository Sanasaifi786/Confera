import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import {connectToSocket} from "./controllers/socketManager.js";
import dotenv from "dotenv";
import { corsMiddleware } from "./config/cors.js";
import { connectDB } from "./config/db.js";
import userRoute from "./routes/userRoute.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

dotenv.config({
    path:"./.env"
});
// app.set("port", process.env.PORT || 8000);
app.use(corsMiddleware);
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

app.use("/api/v1/user",userRoute);

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
