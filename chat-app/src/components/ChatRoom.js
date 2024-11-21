import React, { useState, useEffect, useRef } from "react";
import styles from "../css/ChatRoom.module.css";

export default function ChatRoom({ className, roomId, roomName, socket, userId, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("previous-messages", (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on("receive-message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, message];
        console.log("Updated messages:", updatedMessages);
        return updatedMessages;
      });
      });

    return () => {
      socket.off("receive-message");
      socket.off("previous-messages");
    };
  }, [roomId, socket]);
  
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!userId || !userEmail) {
      console.error("User is not authenticated properly");
      return;
    }
  
    if (newMessage.trim() === "") {
      return;
    }
  
    const userData = JSON.parse(localStorage.getItem("user"));
    const displayName = userData.displayName || userData.email;
  
    const messageData = {
      roomId,
      message: newMessage,
      userId,
      userEmail,
      displayName,
    };
  
    socket.emit("send-message", messageData);
    setNewMessage("");
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={className}>
      <div className={styles.messageContainer}>
        <h1 className={styles.welcomeMessage}>You are now connected to {roomName}</h1>
        {messages.map((msg, index) => (
          <div key={index} className={styles.messages}>
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL}${msg.profilePicture}`} 
              alt={msg.displayName || msg.userEmail} 
              className={styles.profilePicture} 
            />
            <strong>{msg.displayName || msg.userEmail}</strong>: {msg.message}
          </div>
        ))}
        {}
        <div ref={messageEndRef} />
      </div>
      <div>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message:"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}