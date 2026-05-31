import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import express from "express";

const app = express();
const server = createServer(app);
const io = new Server(server);


app.get("/home",(req,res)=>{
    return res.json({"hello":"World"});
})

const start = async()=>{
    app.listen(8000,()=>{
        console.log("Server is running on port 8000");
    })
}

start();