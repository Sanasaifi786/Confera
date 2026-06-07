import React, { useRef } from 'react'

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

  return (
    <div>
      Video Meet
    </div>
  )
}

export default VideoMeetComponent;

//STUN - STUN server are lightweight servers running on the public internet which return the IP address of the requesters device
