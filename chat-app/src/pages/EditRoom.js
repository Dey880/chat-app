import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../css/EditRoom.module.css";

export default function EditRoom() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [roomOwnerEmail, setRoomOwnerEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomResponse = await fetch(
          `http://localhost:4000/api/rooms/${roomId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (roomResponse.ok) {
          const data = await roomResponse.json();
          const room = data.room;

          if (room && room.name && room.description) {
            setName(room.name);
            setDescription(room.description);
          }

          setInvitedEmails(data.invitedUsers);
          const ownerId = room.ownerId;
          if (ownerId) {
            const userResponse = await fetch(
              `http://localhost:4000/api/users/${ownerId}`,
              {
                method: "GET",
                credentials: "include",
              }
            );

            if (userResponse.ok) {
              const user = await userResponse.json();
              setRoomOwnerEmail(user.email);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };
    fetchRoomData();
  }, [roomId]);

  const handleAddEmail = () => {
    if (
      emailInput.trim() &&
      !invitedEmails.some((user) => user.email === emailInput)
    ) {
      setInvitedEmails((prev) => [...prev, { email: emailInput.trim() }]);
    }
    setEmailInput("");
  };

  const handleRemoveEmail = (email) => {
    setInvitedEmails((prev) => prev.filter((user) => user.email !== email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedInvitedEmails = [...invitedEmails];

    if (
      roomOwnerEmail &&
      !updatedInvitedEmails.some((user) => user.email === roomOwnerEmail)
    ) {
      updatedInvitedEmails.push({ email: roomOwnerEmail });
    }

    const roomData = {
      name,
      description,
      invitedEmails: updatedInvitedEmails.map((user) => user.email),
    };

    try {
      const response = await fetch(
        `http://localhost:4000/api/rooms/${roomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(roomData),
        }
      );
      if (response.ok) {
        navigate(`/chat`);
      } else {
        console.error("Failed to update room");
      }
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/rooms/${roomId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        alert("Room deleted successfully");
        navigate(`/chat`);
      } else {
        console.error("Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className={styles.body}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.h2}>Edit Room</h2>
        <span className={styles.inputSpan}>
          <label className={styles.label}>Room Name: </label>
          <input
            required
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </span>
        <span className={styles.inputSpan}>
          <label className={styles.label}>Description: </label>
          <input
            required
            type="text"
            name="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </span>
        <div className={styles.inviteDiv}>
          <label className={styles.label}>Invite Users:</label>
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
              Add
            </button>
          </div>
          <ul>
            {invitedEmails.map((user) => (
              <li key={user.email} className={styles.list}>
                {user.email}{" "}
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(user.email)}
                  className={styles.submit}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <input type="submit" className={styles.submit} value="Update Room" />
        <h2 className={styles.warning}>
          SCARY SECTION
        </h2>
        <button
          type="button"
          onClick={handleDelete}
          className={styles.deleteButton}
        >
          Delete Room
        </button>
      </form>
    </div>
  );
}