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

    // Emoji reactions
    let [showEmojiPicker, setShowEmojiPicker] = useState(false);
    let [reactions, setReactions] = useState([]);
    const EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🎉', '🔥', '🙌'];

    // Chat sidebar
    let [showChat, setShowChat] = useState(false);

    // Host / Waiting Room
    let [isHost, setIsHost] = useState(false);
    let [isWaiting, setIsWaiting] = useState(false);
    let [admissionDenied, setAdmissionDenied] = useState(false);
    let [admissionRequests, setAdmissionRequests] = useState([]); // [{socketId, name}]

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

    let handleUserJoined = (id, clients) => {
        clients.forEach((socketListId) => {
            if (!connections[socketListId]) {
                connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                
                connections[socketListId].onicecandidate = (event) => {
                    if (event.candidate != null) {
                        socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                    }
                };

                connections[socketListId].ontrack = (event) => {
                    const remoteStream = event.streams[0];
                    if (!remoteStream) return;
                    setVideos(prevVideos => {
                        const exists = prevVideos.find(v => v.socketId === socketListId);
                        if (exists) {
                            return prevVideos.map(v =>
                                v.socketId === socketListId ? { ...v, stream: remoteStream } : v
                            );
                        }
                        return [...prevVideos, { socketId: socketListId, stream: remoteStream }];
                    });
                };

                if (window.localStream !== undefined && window.localStream !== null) {
                    window.localStream.getTracks().forEach(track => {
                        connections[socketListId].addTrack(track, window.localStream);
                    });
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                    window.localStream = blackSilence();
                    window.localStream.getTracks().forEach(track => {
                        connections[socketListId].addTrack(track, window.localStream);
                    });
                }
            }
        });

        if (id === socketIdRef.current) {
            for (let id2 in connections) {
                if (id2 === socketIdRef.current) continue;
                try {
                    window.localStream.getTracks().forEach(track => {
                        connections[id2].addTrack(track, window.localStream);
                    });
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
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: true });
        socketRef.current.on('signal', gotMessageFromServer);


        socketRef.current.on('receive-message', addMessage);

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id));
        });

        // Listen for incoming emoji reactions
        socketRef.current.on('reaction', (emoji, sender) => {
            spawnReaction(emoji, sender);
        });

        // --- ADMISSION SYSTEM ---
        // This user is the host
        socketRef.current.on('you-are-host', () => {
            setIsHost(true);
            setAskForUsername(false);
        });

        // This user must wait for admission
        socketRef.current.on('waiting-for-admission', () => {
            setIsWaiting(true);
            setAskForUsername(false);
        });

        // Host receives a request to admit someone
        socketRef.current.on('admission-request', (socketId, name) => {
            setAdmissionRequests(prev => [
                ...prev.filter(r => r.socketId !== socketId),
                { socketId, name }
            ]);
        });

        // Host: waiting user disconnected, remove from list
        socketRef.current.on('waiting-user-left', (socketId) => {
            setAdmissionRequests(prev => prev.filter(r => r.socketId !== socketId));
        });

        // This user was admitted by host — enter meeting
        socketRef.current.on('user-joined', (id, clients) => {
            // If we were waiting, we are now admitted
            setIsWaiting(false);
            handleUserJoined(id, clients);
        });

        // This user was denied by host
        socketRef.current.on('join-denied', () => {
            setAdmissionDenied(true);
            setIsWaiting(false);
        });

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            // Pass username so host sees requester's name
            socketRef.current.emit('join-call', window.location.href, username);
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

    // ---- MUTE MICROPHONE ----
    let handleMute = () => {
        setAudio(prev => {
            const newAudio = !prev;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(track => {
                    track.enabled = newAudio;
                });
            }
            return newAudio;
        });
    }

    // ---- TOGGLE CAMERA ----
    let handleVideo = () => {
        setVideo(prev => {
            const newVideo = !prev;
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(track => {
                    track.enabled = newVideo;
                });
            }
            return newVideo;
        });
    }

    // ---- SCREEN SHARE ----
    let handleScreen = async () => {
        if (!screen) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace video track in all peer connections
                for (let id in connections) {
                    const sender = connections[id]
                        .getSenders()
                        .find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                }

                // Show screen on local preview
                localVideoRef.current.srcObject = screenStream;
                setScreen(true);

                // When screen share ends (user clicks Stop Sharing)
                screenTrack.onended = () => {
                    handleScreen();
                };
            } catch (e) {
                console.log(e);
            }
        } else {
            // Revert back to camera
            if (window.localStream) {
                const cameraTrack = window.localStream.getVideoTracks()[0];
                for (let id in connections) {
                    const sender = connections[id]
                        .getSenders()
                        .find(s => s.track && s.track.kind === 'video');
                    if (sender) sender.replaceTrack(cameraTrack);
                }
                localVideoRef.current.srcObject = window.localStream;
            }
            setScreen(false);
        }
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

    // Spawn a floating emoji animation on screen
    let spawnReaction = (emoji, sender) => {
        const id = Date.now() + Math.random();
        const left = 10 + Math.random() * 80; // random horizontal position %
        setReactions(prev => [...prev, { id, emoji, sender, left }]);
        // Auto-remove after animation completes (3s)
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
    }

    // Send emoji via socket and show locally too
    let sendReaction = (emoji) => {
        if (socketRef.current) {
            socketRef.current.emit("reaction", emoji, username);
        }
        spawnReaction(emoji, username);
        setShowEmojiPicker(false);
    }


    return (
        <div className="video-meet-container">
            {askForUsername === true ?
                <div className="lobby-page">

                    {/* Top Header */}
                    <header className="lobby-header">
                        <div className="lobby-header-logo">
                            <div className="lobby-logo-mark">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                                </svg>
                            </div>
                            <span className="lobby-logo-text">Confera</span>
                        </div>
                    </header>

                    {/* Main Body */}
                    <div className="lobby-body">

                        {/* Left — Video Preview */}
                        <div className="lobby-video-side">
                            <div className="lobby-video-box">
                                {!videoAvailable && (
                                    <div className="lobby-avatar-fallback">
                                        {username ? username.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                                <video ref={localVideoRef} autoPlay muted className="lobby-video-el"></video>
                            </div>
                            <p className="lobby-video-label">Your camera preview</p>
                        </div>

                        {/* Right — Join Panel */}
                        <div className="lobby-join-side">
                            <h1 className="lobby-join-title">Ready to join?</h1>
                            <p className="lobby-join-sub">Enter your name and join the meeting</p>

                            <input
                                type="text"
                                className="lobby-name-input"
                                placeholder="Your name"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && connect()}
                            />

                            <button
                                className="lobby-join-btn"
                                onClick={connect}
                                disabled={!username.trim()}
                            >
                                Join Meeting →
                            </button>
                        </div>

                    </div>
                </div>
            : admissionDenied ? (
                <div className="waiting-page">
                    <div className="waiting-card denied">
                        <div className="waiting-icon denied-icon">🚫</div>
                        <h2>Access Denied</h2>
                        <p>The host did not admit you to this meeting.</p>
                        <button className="waiting-leave-btn" onClick={() => window.location.href = '/'}>Go Home</button>
                    </div>
                </div>
            ) : isWaiting ? (
                <div className="waiting-page">
                    <div className="waiting-card">
                        <div className="waiting-spinner"></div>
                        <h2>Waiting for host to admit you…</h2>
                        <p>The host will let you in soon. Please wait.</p>
                        <div className="waiting-user-info">Joining as <strong>{username}</strong></div>
                        <button className="waiting-leave-btn" onClick={() => window.location.href = '/'}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className={`meet-container ${showChat ? 'chat-open' : ''}`}>


                    {/* Floating Emoji Reactions Overlay */}
                    <div className="reactions-overlay">
                        {reactions.map(r => (
                            <div
                                key={r.id}
                                className="reaction-float"
                                style={{ left: `${r.left}%` }}
                            >
                                <span className="reaction-emoji">{r.emoji}</span>
                                <span className="reaction-sender">{r.sender}</span>
                            </div>
                        ))}
                    </div>

                    {/* Host Admission Panel */}
                    {isHost && admissionRequests.length > 0 && (
                        <div className="admission-panel">
                            <div className="admission-panel-title">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                                </svg>
                                Waiting to join
                            </div>
                            {admissionRequests.map(req => (
                                <div key={req.socketId} className="admission-request-row">
                                    <div className="admission-avatar">
                                        {req.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="admission-name">{req.name}</span>
                                    <button
                                        className="admission-btn admit"
                                        onClick={() => {
                                            socketRef.current.emit('admit-user', window.location.href, req.socketId);
                                            setAdmissionRequests(prev => prev.filter(r => r.socketId !== req.socketId));
                                        }}
                                    >
                                        Admit
                                    </button>
                                    <button
                                        className="admission-btn deny"
                                        onClick={() => {
                                            socketRef.current.emit('deny-user', window.location.href, req.socketId);
                                            setAdmissionRequests(prev => prev.filter(r => r.socketId !== req.socketId));
                                        }}
                                    >
                                        Deny
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="video-grid-container">

                        <div className="video-item">
                            {(!videoAvailable || video === false) && (
                                <div className="video-avatar-fallback">
                                    {username ? username.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                            <video ref={localVideoRef} autoPlay muted className="local-video active"></video>
                            <div className="video-name-tag">
                                You {isHost && <span className="host-badge">HOST</span>}
                            </div>
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
                                    playsInline
                                    className="remote-video"
                                ></video>
                                <div className="video-name-tag">Participant {index + 1}</div>
                            </div>
                        ))}
                    </div>

                    {/* Control Bar */}
                    <div className="control-bar">

                        {/* Mute Button */}
                        <button
                            className={`ctrl-btn ${!audio ? 'ctrl-btn-off' : ''}`}
                            onClick={handleMute}
                            title={audio ? 'Mute' : 'Unmute'}
                        >
                            {audio
                                ? <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                                : <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c.57-.08 1.12-.24 1.64-.46L19.73 21 21 19.73 4.27 3z"/></svg>
                            }
                        </button>

                        {/* Camera Button */}
                        <button
                            className={`ctrl-btn ${!video ? 'ctrl-btn-off' : ''}`}
                            onClick={handleVideo}
                            title={video ? 'Turn off camera' : 'Turn on camera'}
                        >
                            {video
                                ? <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                                : <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M21 6.5l-4-4-15 15 1.41 1.41L9 13.33V17c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V6.5zM16 16H11.33l5-5L16 16zM4 7.33L2.5 5.83 2 6.5V17c0 .55.45 1 1 1h14.33l-2-2H4V7.33z"/></svg>
                            }
                        </button>

                        {/* Screen Share Button */}
                        {screenAvailable && (
                            <button
                                className={`ctrl-btn ${screen ? 'ctrl-btn-active' : ''}`}
                                onClick={handleScreen}
                                title={screen ? 'Stop sharing' : 'Share screen'}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78.48-4.34 1.71-5.5 3.72.14-1.4.46-4.27 3.5-5.93V8l4 3.5-2 1z"/></svg>
                            </button>
                        )}

                        {/* Emoji Reaction Button */}
                        <div className="emoji-picker-wrapper">
                            {showEmojiPicker && (
                                <div className="emoji-picker-popup">
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            className="emoji-option"
                                            onClick={() => sendReaction(emoji)}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button
                                className={`ctrl-btn ${showEmojiPicker ? 'ctrl-btn-active' : ''}`}
                                onClick={() => setShowEmojiPicker(prev => !prev)}
                                title="Send reaction"
                            >
                                😊
                            </button>
                        </div>

                        {/* Chat Toggle Button */}
                        <button
                            className={`ctrl-btn ${showChat ? 'ctrl-btn-active' : ''}`}
                            onClick={() => { setShowChat(prev => !prev); setNewMessage(0); }}
                            title="Chat"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
                            {newMessage > 0 && !showChat && (
                                <span className="chat-badge">{newMessage}</span>
                            )}
                        </button>

                        {/* Participant Count */}
                        <div className="ctrl-participant-count">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            <span>{videos.length + 1}</span>
                        </div>

                        {/* Leave Button */}
                        <button
                            className="ctrl-btn ctrl-btn-leave"
                            onClick={() => window.location.href = '/'}
                            title="Leave meeting"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                        </button>

                    </div>

                    {/* Chat Sidebar */}
                    {showChat && (
                        <div className="chat-sidebar">
                            <div className="chat-header">
                                <span>In-call messages</span>
                                <button className="chat-close-btn" onClick={() => setShowChat(false)}>
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                                </button>
                            </div>

                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="chat-empty">
                                        <p>💬 No messages yet</p>
                                        <span>Send a message to everyone in this call</span>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`chat-bubble ${
                                                msg.sender === username ? 'chat-bubble-self' : 'chat-bubble-other'
                                            }`}
                                        >
                                            {msg.sender !== username && (
                                                <span className="chat-sender">{msg.sender}</span>
                                            )}
                                            <p className="chat-text">{msg.data}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="chat-input-area">
                                <input
                                    className="chat-input"
                                    type="text"
                                    placeholder="Send a message..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button
                                    className="chat-send-btn"
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}

export default VideoMeetComponent;

