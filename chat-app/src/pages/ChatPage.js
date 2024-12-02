import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import ChatRoom from "../components/ChatRoom";
import io from "socket.io-client";
import styles from "../css/ChatPage.module.css";

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

export default function ChatPage() {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const displayName = user.displayName || user.email;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/rooms", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch rooms");
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleSelectRoom = (roomId) => {
    const room = rooms.find((room) => room._id === roomId);
    setSelectedRoom(room);
  };

  const handleEditRoom = (room) => {
    navigate(`/edit-room/${room._id}`);
  };

  return (
    <div className={styles.parent}>
      <Sidebar
        rooms={rooms}
        selectRoom={handleSelectRoom}
        onEditRoom={handleEditRoom}
        user={user}
      />
      {selectedRoom ? (
        <ChatRoom
          className={styles.ChatRoom}
          roomId={selectedRoom._id}
          roomName={selectedRoom.name}
          socket={socket}
          userId={user.userId}
          userEmail={user.email}
          displayName={displayName}
        />
      ) : (
        <div className={styles.placeHolder}>
          Select a room to start chatting!
        </div>
      )}
    </div>
  );
}