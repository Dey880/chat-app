import React from "react";
import styles from "../css/SideBar.module.css"

export default function Sidebar({ rooms, selectRoom }) {
    return (
        <div className={styles.sidebar}>
          <h2>Chat Rooms: </h2>
          <ul>
            {rooms.map((room) => (
              <li key={room.id} onClick={() => selectRoom(room.id)}>
                {room.name}
              </li>
            ))}
          </ul>
        </div>
      );
}