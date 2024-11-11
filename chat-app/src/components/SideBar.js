import React from "react";

export default function Sidebar({ rooms, selectRoom }) {
    return (
        <div className="sidebar">
          <h2>Chat Rooms</h2>
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