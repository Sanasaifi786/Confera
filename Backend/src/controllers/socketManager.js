import {Server} from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
let hosts = {};       // room → hostSocketId
let waitingRoom = {}; // room → [{socketId, name}]

export const connectToSocket = (server)=>{
    const io = new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });

    io.on("connection",(socket)=>{
        console.log("Something Connected");

        socket.on("join-call", (path, username) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }

            const isFirstPerson = connections[path].length === 0;

            if (isFirstPerson) {
                // First person = HOST, enter immediately
                connections[path].push(socket.id);
                timeOnline[socket.id] = new Date();
                hosts[path] = socket.id;

                // Notify this socket they are the host
                io.to(socket.id).emit("you-are-host");

                // Tell everyone in the room (just themselves) they joined
                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
                }

                if (messages[path]) {
                    for (let a = 0; a < messages[path].length; a++) {
                        io.to(socket.id).emit("receive-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender'], messages[path][a]['timestamp']);
                    }
                }
            } else {
                // Not first → go to waiting room, notify host
                if (!waitingRoom[path]) waitingRoom[path] = [];
                waitingRoom[path].push({ socketId: socket.id, name: username || 'Guest' });
                timeOnline[socket.id] = new Date();

                // Tell the joining user they are waiting
                io.to(socket.id).emit("waiting-for-admission");

                // Notify the host
                const hostId = hosts[path];
                if (hostId) {
                    io.to(hostId).emit("admission-request", socket.id, username || 'Guest');
                }
            }
        });

        // Host admits a user
        socket.on("admit-user", (path, waitingSocketId) => {
            if (!waitingRoom[path]) return;

            // Remove from waiting room
            waitingRoom[path] = waitingRoom[path].filter(u => u.socketId !== waitingSocketId);

            // Add to connections
            connections[path].push(waitingSocketId);

            // Tell everyone in the room a new user joined
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", waitingSocketId, connections[path]);
            }

            // Send past messages to the admitted user
            if (messages[path]) {
                for (let a = 0; a < messages[path].length; a++) {
                    io.to(waitingSocketId).emit("receive-message", messages[path][a]['data'], messages[path][a]['sender'], messages[path][a]['socket-id-sender'], messages[path][a]['timestamp']);
                }
            }
        });

        // Host denies a user
        socket.on("deny-user", (path, waitingSocketId) => {
            if (!waitingRoom[path]) return;
            waitingRoom[path] = waitingRoom[path].filter(u => u.socketId !== waitingSocketId);
            io.to(waitingSocketId).emit("join-denied");
        });

        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })

        socket.on("chat-message", (data, sender, timestamp)=>{
            const [matchingRoom,found] = Object.entries(connections)
            .reduce(([room,isFound],[roomKey,roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomKey,true];
                }
                return [room,isFound];
            },['',false]);

            if(found===true){
                if(messages[matchingRoom]==undefined){
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({'sender':sender, "data":data,"socket-id-sender":socket.id, "timestamp": timestamp});
                connections[matchingRoom].forEach(elem=>{
                    io.to(elem).emit("receive-message", data, sender, socket.id, timestamp);
                })
            }
        })

        // Emoji Reaction — broadcast to everyone in the room
        socket.on("reaction", (emoji, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) return [roomKey, true];
                    return [room, isFound];
                }, ['', false]);

            if (found) {
                connections[matchingRoom].forEach(elem => {
                    io.to(elem).emit("reaction", emoji, sender);
                });
            }
        })

        socket.on("disconnect",()=>{
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());
            var key;
            for(const [k,v] of Object.entries(connections)){
                for(let a = 0 ; a<v.length; a++)
                {
                    if(v[a]===socket.id){
                        key = k;
                        for(let b = 0; b<connections[key].length; b++){
                            io.to(connections[key][b]).emit("user-left",socket.id);
                        }
                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index,1);

                        // If host left, promote next person
                        if (hosts[key] === socket.id && connections[key].length > 0) {
                            hosts[key] = connections[key][0];
                            io.to(hosts[key]).emit("you-are-host");
                        }

                        if(connections[key].length==0){
                            delete connections[key];
                            delete hosts[key];
                            delete waitingRoom[key];
                        }
                    }
                }
            }

            // Remove from waiting room too if they disconnect while waiting
            for (const [room, waiters] of Object.entries(waitingRoom)) {
                const idx = waiters.findIndex(u => u.socketId === socket.id);
                if (idx !== -1) {
                    waitingRoom[room].splice(idx, 1);
                    // Notify host to update their list
                    if (hosts[room]) {
                        io.to(hosts[room]).emit("waiting-user-left", socket.id);
                    }
                }
            }
        })
    });
    return io;
}
