import React, { useRef, useState, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import { io } from 'socket.io-client';
import '../styles/videoComponent.css';

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setShowModal] = useState();
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessage, setNewMessage] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoRef = useRef();
    let [videos, setVideos] = useState([]);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getPermissions();
    }, [])

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }

        stream.getVideoTracks()[0].onended = () => {
            setVideo(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e) }
            
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                        })
                        .catch(e => console.log(e));
                });
            }
        }
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) {
                console.log(e);
            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video])

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessage((prev) => prev + 1);
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: true });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('user-joined', (id, clients) => {
            clients.forEach((socketListId) => {
                if (!connections[socketListId]) {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].onaddstream = (event) => {
                        console.log("GOT DISPLAY MEDIA");
                        let videoExists = videoRef.current !== undefined;
                        if (videoExists) {
                            // Update videos array
                            setVideos(videos => {
                                let updatedVideos = [...videos];
                                let found = false;
                                for (let i = 0; i < updatedVideos.length; i++) {
                                    if (updatedVideos[i].socketId === socketListId) {
                                        updatedVideos[i].stream = event.stream;
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    updatedVideos.push({ socketId: socketListId, stream: event.stream, autoPlay: true, playsinline: true });
                                }
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                }
            });

            if (id === socketIdRef.current) {
                for (let id2 in connections) {
                    if (id2 === socketIdRef.current) continue;
                    try {
                        connections[id2].addStream(window.localStream);
                    } catch (e) { }

                    connections[id2].createOffer().then((description) => {
                        connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                            })
                            .catch(e => console.log(e));
                    });
                }
            }
        });

        socketRef.current.on('receive-message', addMessage);

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id));
        });
        
        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit('join-call', window.location.href);
        });
    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let sendMessage = () => {
        if (message.trim() === "") return;
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    return (
        <div className="video-meet-container">
            {askForUsername === true ?
                <div className="lobby-container">
                    <div className="lobby-card">
                        <h2>Enter into Lobby</h2>
                        <TextField label="Username" variant="outlined" value={username} onChange={e => setUsername(e.target.value)} className="lobby-input" />
                        <Button variant="contained" onClick={connect} className="join-btn">Join</Button>
                        <div className="local-video-wrapper">
                            {!videoAvailable && (
                                <div className="video-avatar-fallback">
                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <video ref={localVideoRef} autoPlay muted className="local-video"></video>
                        </div>
                    </div>
                </div> :
                <div className="meet-container">
                    <div className="video-grid-container">
                        <div className="video-item">
                            {(!videoAvailable || video === false) && (
                                <div className="video-avatar-fallback">
                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <video ref={localVideoRef} autoPlay muted className="local-video active"></video>
                        </div>
                        {videos.map((videoItem, index) => (
                            <div key={index} className="video-item">
                                <video
                                    ref={ref => {
                                        if (ref && videoItem.stream) {
                                            ref.srcObject = videoItem.stream;
                                        }
                                    }}
                                    autoPlay
                                    className="remote-video"
                                ></video>
                            </div>
                        ))}
                    </div>
                    
                    <div className="control-bar">
                        <Button variant="contained" className="leave-btn" onClick={() => window.location.href="/"}>
                            Leave Meeting
                        </Button>
                    </div>

                    <div className="chat-sidebar">
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="chat-message">
                                    <strong>{msg.sender}</strong>: {msg.data}
                                </div>
                            ))}
                        </div>
                        <div className="chat-input-container">
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Type a message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={sendMessage} className="chat-send-btn">Send</Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default VideoMeetComponent;

