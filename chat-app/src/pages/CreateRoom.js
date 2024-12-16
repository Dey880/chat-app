import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/CreateRoom.module.css";

export default function CreateRoom({ userId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);  // Track if user is admin
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/user", {
          method: "GET",
          credentials: "include", // Include credentials to use the cookie
        });
        if (response.ok) {
          const user = await response.json();
          setIsAdmin(user.role === "admin");
          setIsPublic(user.role === "admin");  // Default to public for admins
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
  
    fetchUserRole();
  }, []);  

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
    <div className={styles.body}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>Create a Room</h2>
        <span className={styles.inputSpan}>
          <label className={styles.label}> Room Name: </label>
          <input
            required
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </span>
        <span className={styles.inputSpan}>
          <label className={styles.label}> Description: </label>
          <input
            required
            type="text"
            name="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </span>

        {isAdmin && (
          <label className={styles.materialCheckbox}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className={styles.checkmark}></span>
            Public?
          </label>
        )}

        <div className={styles.inviteDiv}>
          <label className={styles.label}> Invite Users: </label>
          <div className={styles.div}>
            <span className={styles.inputSpan}>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email: "
              />
            </span>
            <button
              type="button"
              onClick={handleAddEmail}
              className={styles.submit}
            >
              {" "}
              Add{" "}
            </button>
          </div>
          <ul>
            {invitedEmails.map((email) => (
              <li key={email} className={styles.list}>
                {email}{" "}
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className={styles.submit}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <input type="submit" className={styles.submit} value={"Create Room"} />
      </form>
    </div>
  );
}