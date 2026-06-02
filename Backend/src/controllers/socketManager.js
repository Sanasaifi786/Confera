import {Server} from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server)=>{
    const io = new Server(server);

    io.on("connection",(socket)=>{

        socket.on("join-call",(path)=>{
            if(connections[path]==undefined){
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            for(let a = 0; a<connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined",socket.id,connections[path]);
            }

            if(messages[path]){
                for(let a = 0; a<messages[path].length; a++){
                    io.to(socket.id).emit("receive-message",messages[path][a]['data'],messages[path][a]['sender'],messages[path][a]['socket-id-sender']);
                }
            }
        })

        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })
        socket.on("chat-message", (data,sender)=>{
            const [matchingRoom,found] = Object.entries(connections)
            .reduce(([room,isFound],[roomKey,roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey,true];
            }}
            return [room,isFound];
            },['',false]);

            if(found===true){
                if(messages[matchingRoom]==undefined){
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({'sender':sender, "data":data,"socket-id-sender":socket.id});
                connections[matchingRoom].forEach(elem=>{
                    io.to(elem).emit("receive-message",data,sender,socket.id);
                })
            }
        })
    return io;
}

