import React, { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [role, setRole] = useState("user");

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/user`, 
            {
                email: email, 
                password: password, 
                repeatPassword: repeatPassword,
                role: role
            }
        ).then((response) => {
            if (response.data.status === "login") {
                navigate("/login");
            } else {
                console.log("User creation error:", response.data.error);
            }
        }).catch((error) => {
            console.log("Error during registration:", error);
        });
        
    }

    return (
        <>
            <h1>Create User</h1>
            <form onSubmit={handleSubmit}> 
                <input type='email' placeholder='email' onChange={(e) => setEmail(e.target.value)} />
                <input type='password' placeholder='password' onChange={(e) => setPassword(e.target.value)} />
                <input type='password' placeholder='repeat password' onChange={(e) => setRepeatPassword(e.target.value)} />
                <select onChange={(e) => setRole(e.target.value)} value={role}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                </select>
                <button type="submit">Register User</button>
            </form>
        </>
    );
};