import React, { useState, useEffect } from "react";

export default function ChatRoom({ roomId, socket, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);
  
    socket.on("previous-messages", (previousMessages) => {
      setMessages(previousMessages);
    });
  
    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]); // Add the new message to the state
    });
  
    return () => {
      socket.off("receive-message");
      socket.off("previous-messages");
    };
  }, [roomId, socket]);  

  const sendMessage = () => {
    const messageData = { roomId, message: newMessage, userId };
    socket.emit("send-message", messageData);
    setNewMessage("");
  };

  return (
    <div className="chatroom">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userId}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}