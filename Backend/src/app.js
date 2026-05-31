import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import {connectToSocket} from "./controllers/socketManager.js";
import mongoose from "mongoose";
import cors from "cors";
import express from "express";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));

const start = async()=>{
    app.listen(8000,()=>{
        console.log("Server is running on port 8000");
    })
}

start();