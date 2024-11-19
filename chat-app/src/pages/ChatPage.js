import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import ChatRoom from "../components/ChatRoom";
import io from "socket.io-client";

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const rooms = [
    { id: "general", name: "General" },
    { id: "tech-talk", name: "Tech Talk" },
  ];

  const handleSelectRoom = (roomId) => {
    const room = rooms.find((room) => room.id === roomId);
    setSelectedRoom(room);
  };

  return (
    <div className="chat-page">
      <Sidebar rooms={rooms} selectRoom={handleSelectRoom} />
      {selectedRoom ? (
        <ChatRoom
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          socket={socket}
          userId={JSON.parse(localStorage.getItem('user')).userId}
          userEmail={JSON.parse(localStorage.getItem('user')).email}
        />
      ) : (
        <div>Select a room to start chatting!</div>
      )}
    </div>
  );
}