import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../css/SideBar.module.css";
import apiClient from "../config/axiosConfig";

export default function Sidebar({ rooms, selectRoom }) {
  const [pinnedRooms, setPinnedRooms] = useState([]);

  useEffect(() => {
    // Use apiClient instead of axios directly to ensure the request goes to the correct backend URL
    apiClient.get("/api/user/pinned-rooms", { withCredentials: true })
      .then((response) => setPinnedRooms(response.data.pinnedRooms))
      .catch((err) => console.error("Error fetching pinned rooms:", err));
  }, []);
  

  const togglePinRoom = async (roomId) => {
    try {
      const response = await apiClient.post("/api/user/pinned-rooms", { roomId });
      console.log("Pinned rooms updated:", response.data);
      setPinnedRooms(response.data.pinnedRooms); // Update the state with the latest pinned rooms
    } catch (error) {
      console.error("Error updating pinned rooms:", error);
    }
  };
  
  // Separate rooms into pinned and not pinned based on the server data
  const pinned = rooms.filter((room) => pinnedRooms.includes(room._id));
  const notPinned = rooms.filter((room) => !pinnedRooms.includes(room._id));

  return (
    <div className={styles.sidebar}>
      <h2>Chat Rooms:</h2>
      {pinned.length > 0 && <h3>Pinned Rooms:</h3>}
      <ul>
        {pinned.map((room) => (
          <li key={room._id} className={styles.roomItem}>
            <span onClick={() => selectRoom(room._id)}>
              {room.name} {room.isPublic ? "(Public)" : "(Private)"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinRoom(room._id); // Unpin room
              }}
              className={styles.pinButton}
            >
              Unpin
            </button>
          </li>
        ))}
      </ul>
      {notPinned.length > 0 && <h3>Other Rooms:</h3>}
      <ul>
        {notPinned.map((room) => (
          <li key={room._id} className={styles.roomItem}>
            <span onClick={() => selectRoom(room._id)}>
              {room.name} {room.isPublic ? "(Public)" : "(Private)"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinRoom(room._id); // Pin room
              }}
              className={styles.pinButton}
            >
              Pin
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}