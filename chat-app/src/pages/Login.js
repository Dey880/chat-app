import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        
        axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/login`,
            {
                email: email,
                password: password
            },
            {
                withCredentials: true
            }        
        ).then((response) => {
                if (response.data.status === "login") {
                    const token = response.data.token;
                    if (token) {
                        const decoded = jwtDecode(token);
                        navigate("/About");
                    } else {
                        console.log("No token received.");
                    }
                } else {
                    console.log("Login failed:", response.data);
                }
            }).catch((error) => {
                console.log("Error:", error);
            });
    };

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}> 
                <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </>
    );
};