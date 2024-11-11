import React, { useState, useEffect } from "react";

export default function ChatRoom({ roomId, socket, userId, userEmail }) {
  const [messages, setMessages] = useState([]); // To store messages in state
  const [newMessage, setNewMessage] = useState(""); // To hold the new message input

  useEffect(() => {
    socket.emit("join-room", roomId);
  
    // Listen for previous messages when the user joins the room
    socket.on("previous-messages", (previousMessages) => {
      setMessages(previousMessages);
    });
  
    // Listen for new messages and update state when a message is received
    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]); // Add new message to state
    });
  
    // Cleanup event listeners when the component unmounts
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

    const messageData = { 
      roomId, 
      message: newMessage, 
      userId, 
      userEmail 
    };

    // Emit the message to the server
    socket.emit("send-message", messageData);

    // Clear the input after sending the message
    setNewMessage("");
  };

  return (
    <div className="chatroom">
      <div className="messages">
        {/* Display the list of messages */}
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userEmail || "Unknown User"}</strong>: {msg.message}
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