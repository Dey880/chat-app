import React from "react";
import { Link } from "react-router-dom";
import styles from "../css/SideBar.module.css";

export default function Sidebar({ rooms, selectRoom, user }) {
  const canEditRoom = (room) => {
    return room.isOwner === user._id || ["admin", "moderator"].includes(user.role);
  };

  return (
    <div className={styles.sidebar}>
      <h2>Chat Rooms: </h2>
      <ul>
        {rooms.map((room) => (
          <li
            key={room._id}
            className={room.isPublic ? styles.publicRoom : styles.privateRoom}
          >
            <span onClick={() => selectRoom(room._id)}>
              {room.name} {room.isPublic ? "(Public)" : "(Private)"}
            </span>
            {canEditRoom(room) && (
              <Link to={`/edit-room/${room._id}`} className={styles.editButton}>
                Edit
              </Link>
            )}
          </li>
        ))}
      </ul>
      <Link to="/create" className={styles.createButtonContainer}>
        <button className={styles.submit}>Create A Room</button>
      </Link>
    </div>
  );
}