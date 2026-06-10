import React, { useRef, useState } from 'react'

const server_url  = "http://localhost:8000";

var connections = {};

const peerCongifConnections = {
    "iceServers":[
        {"urls": "stun.l.google.com:19302"}
    ]
}

function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setShowModal] = useState();
    let [screenAvaliable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessage, setNewMessage] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);

    const videoRef = useRef();
     let [videos, setVideos] = useState([]);

     

  return (
    <div>
      Video Meet
    </div>
  )
}

export default VideoMeetComponent;

//STUN - STUN server are lightweight servers running on the public internet which return the IP address of the requesters device
