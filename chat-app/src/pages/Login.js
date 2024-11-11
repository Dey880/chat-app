import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "../css/Login.module.css";
import Info from '../components/Info.js';
import AboutButton from "../components/AboutButton.js";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = (e) => {
        e.preventDefault();
        
        axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/login`,
            { email, password },
            { withCredentials: true }  // This ensures the cookie is sent
        ).then((response) => {
            if (response.data.status === "login") {
                const token = response.data.token;
                if (token) {
                    // Decode the JWT token to get user data
                    const decoded = jwtDecode(token);
                    
                    // Save the decoded user data to localStorage or Context
                    console.log("Token received:", token);
                    localStorage.setItem('user', JSON.stringify(decoded));
                    navigate('/chat');
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
        <AboutButton />
        <ul className={styles.loginUl}>
            <li className={styles.loginLi}>Welcome</li>
            <li className={styles.loginLi}>To</li>
            <li className={styles.loginLi}><strong>CHATTER’N</strong></li>
        </ul>
        <hr className={styles.loginHr}/>
        <h1 className={styles.loginText}>Login</h1>
        <div className={styles.loginFormContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}> 
                <input className={`${styles.loginEmail} ${styles.loginInput}`} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input className={`${styles.loginPassword} ${styles.loginInput}`} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button className={`${styles.loginSubmit} ${styles.loginInput}`} type="submit">Login</button>
            </form>
        </div>
        <h1 className={styles.loginH1}>Don't have an account? <a className={styles.loginA} href='/createUser'>Sign up</a></h1>
        <Info />
        </>
    );
};