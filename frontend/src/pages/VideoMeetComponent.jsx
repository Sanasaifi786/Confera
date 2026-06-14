import React, { useRef, useState, useEffect } from 'react'
import { TextField, Button } from '@mui/material'
import "../styles/VideoMeetComponent.css"
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
    let [username, setUsername] = useState("");

    const videoRef = useRef();
     let [videos, setVideos] = useState([]);

      const getPermissions = async()=>{
        try{
          const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});
          if(videoPermission){
            setVideoAvailable(true);
          }
          else{
            setVideoAvailable(false);
          }
           const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});
          if(audioPermission){
            setAudioAvailable(true);
          }
          else{
            setAudioAvailable(false);
          }
        }
        catch(err){

        }
      }

     useEffect(()=>{
      getPermissions();
     },[])
  return (
    <div>
      {askForUsername==true ?
      <div>
        <h2>Enter into Lobby</h2>
        <TextField label="Username" variant="outlined" value={username} onChange={e=> setUsername(e.target.value)}/>
        <Button variant="contained">Join</Button>
        <div>
          <video ref={videoRef} autoPlay muted></video>
        </div>
      </div>:<></>
      }
    </div>
  )
}

export default VideoMeetComponent;

//STUN - STUN server are lightweight servers running on the public internet which return the IP address of the requesters device
