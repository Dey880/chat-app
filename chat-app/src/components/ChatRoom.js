import React, { useState, useEffect } from "react";

export default function ChatRoom({ roomId, roomName, socket, userId, userEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("previous-messages", (previousMessages) => {
      setMessages(previousMessages);
    });

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("receive-message");
      socket.off("previous-messages");
    };
  }, [roomId, socket]);

  const sendMessage = () => {
    if (!userId || !userEmail) {
      console.error("User is not authenticated properly");
      return;
    }

    if (newMessage.trim() === "") {
      return;
    }

    const messageData = {
      roomId,
      message: newMessage,
      userId,
      userEmail,
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
    <div className="chatroom">
      <div className="messages">
        <h1>You are now connected to {roomName}</h1>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userEmail || "Unknown User"}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message:"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}