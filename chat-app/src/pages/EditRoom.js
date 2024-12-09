import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function EditRoom() {
  const [room, setRoom] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [invitedUsers, setInvitedUsers] = useState([]);
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoom = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("JWT Token:", token);

      try {
        const response = await axios.get(
          `http://localhost:4000/api/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRoom(response.data);
        setName(response.data.name);
        setDescription(response.data.description);
        setInvitedUsers(response.data.invitedUsers);
      } catch (error) {
        console.error("Error fetching room:", error);
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    try {
      await axios.put(
        `http://localhost:4000/api/rooms/${roomId}`,
        {
          name,
          description,
          invitedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      navigate("/chat");
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div>
      <h2>Edit Room</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room Name"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Room Description"
        />
        {/* Add UI for managing invited users here */}
        <button type="submit">Update Room</button>
      </form>
    </div>
  );
}