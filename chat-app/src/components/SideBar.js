import React from "react";
import styles from "../css/SideBar.module.css";

export default function Sidebar({ rooms, selectRoom, onEditRoom, user }) {
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
            {/* {(["admin", "moderator"].includes(user.role) ||
              room.isOwner === user.userId) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditRoom(room);
                }}
                className={styles.editButton}
              >
                Edit
              </button>
            )} */}
          </li>
        ))}
      </ul>
      <a href="/create" className={styles.createButtonContainer}>
        <button className={styles.submit}>Create A Room</button>
      </a>
    </div>
  );
}