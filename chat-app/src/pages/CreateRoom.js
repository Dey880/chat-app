import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateRoom({ userId }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  const handleAddEmail = () => {
    if (emailInput.trim() && !invitedEmails.includes(emailInput)) {
      setInvitedEmails((prev) => [...prev, emailInput.trim()]);
    }
    setEmailInput("");
  };

  const handleRemoveEmail = (email) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const roomData = {
      name,
      description,
      isPublic,
      invitedEmails,
    };
  
    try {
      const response = await fetch("http://localhost:4000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(roomData),
      });
  
      if (response.ok) {
        const newRoom = await response.json();
        console.log("Room created successfully:", newRoom);
        navigate(`/chat`);
      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };  

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a Room</h2>
      <div>
        <label>Room Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>
          Public:
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </label>
      </div>
      {!isPublic && (
        <div>
          <label>Invite Users:</label>
          <div>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter user email"
            />
            <button type="button" onClick={handleAddEmail}>
              Add
            </button>
          </div>
          <ul>
            {invitedEmails.map((email) => (
              <li key={email}>
                {email}{" "}
                <button type="button" onClick={() => handleRemoveEmail(email)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button type="submit">Create Room</button>
    </form>
  );
}