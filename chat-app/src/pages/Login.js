import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "../css/Login.module.css";
import Info from "../components/Info.js";
import AboutButton from "../components/AboutButton.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        "http://localhost:4000/api/login",
        { email, password },
        { withCredentials: true }
      )
      .then((response) => {
        if (response.data.status === "login") {
          const token = response.data.token;
          if (token) {
            const decoded = jwtDecode(token);
            localStorage.setItem("user", JSON.stringify(decoded));
            navigate("/chat");
          } else {
            alert("No token received. Please try again.");
          }
        } else {
          alert("Login failed. Please check your credentials.");
        }
      })
      .catch((error) => {
        if (error.response) {
          alert(error.response.data.error || "An error occurred during login.");
        } else if (error.request) {
          alert("No response from server. Please try again later.");
        } else {
          alert("An unexpected error occurred.");
        }
        console.error("Login error:", error);
      });
  };

  return (
    <>
      <AboutButton />
      <ul className={styles.loginUl}>
        <li className={styles.loginLi}>Welcome</li>
        <li className={styles.loginLi}>To</li>
        <li className={styles.loginLi}>
          <strong>CHATTER’N</strong>
        </li>
      </ul>
      <hr className={styles.loginHr} />
      <h1 className={styles.loginText}>Login</h1>
      <div className={styles.loginFormContainer}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <input
            className={`${styles.loginEmail} ${styles.loginInput}`}
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={`${styles.loginPassword} ${styles.loginInput}`}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className={`${styles.loginSubmit} ${styles.loginInput}`}
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
      <h1 className={styles.loginH1}>
        Don't have an account?{" "}
        <a className={styles.loginA} href="/createUser">
          Sign up
        </a>
      </h1>
      <Info />
    </>
  );
}