import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import ChatRoom from "../components/ChatRoom";
import io from "socket.io-client";
import styles from '../css/ChatPage.module.css'



const socket = io(`${process.env.REACT_APP_BACKEND_URL}`, {
  withCredentials: true,
});

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    { id: "general", name: "General" },
    { id: "tech-talk", name: "Tech Talk" },
    { id: "spam", name: "Spam" },
  ];

  const handleSelectRoom = (roomId) => {
    const room = rooms.find((room) => room.id === roomId);
    setSelectedRoom(room);
  };

const user = JSON.parse(localStorage.getItem("user"));
const displayName = user.displayName || user.email;

return (
  <div className={styles.parent}>
    <Sidebar
      rooms={rooms}
      selectRoom={handleSelectRoom}
      classname={styles.sidebar}
    />
    {selectedRoom ? (
      <ChatRoom
        className={styles.ChatRoom}
        roomId={selectedRoom.id}
        roomName={selectedRoom.name}
        socket={socket}
        userId={user.userId}
        userEmail={user.email}
        displayName={displayName}
      />
    ) : (
      <div>Select a room to start chatting!</div>
    )}
  </div>
);

}