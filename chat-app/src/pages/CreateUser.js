import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../css/CreateUser.module.css";
import Info from "../components/Info.js";
import AboutButton from "../components/AboutButton.js";

export default function CreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState("user");
  const [userRole, setUserRole] = useState(null); // To store the current user's role (admin, user, etc.)

  const navigate = useNavigate();

  // Fetch the current user's role when the component mounts
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/user", { withCredentials: true }) // Assuming the API gives user data with role
      .then((response) => {
        setUserRole(response.data.role); // Store the role of the logged-in user
      })
      .catch((error) => {
        console.log("Error fetching user role:", error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`http://localhost:4000/api/user`, {
        email: email,
        password: password,
        repeatPassword: repeatPassword,
        role: role,
      })
      .then((response) => {
        if (response.data.status === "login") {
          navigate("/login");
        } else {
          console.log("User creation error:", response.data.error);
        }
      })
      .catch((error) => {
        console.log("Error during registration:", error);
      });
  };

  return (
    <>
      <AboutButton />

      <ul className={styles.createUserLoginUl}>
        <li className={styles.createUserLoginLi}>Welcome</li>
        <li className={styles.createUserLoginLi}>To</li>
        <li className={styles.createUserLoginLi}>
          <strong>CHATTER’N</strong>
        </li>
      </ul>
      <hr className={styles.createUserLoginHr} />
      <h1 className={styles.createUserLoginText}>Sign up</h1>
      <div className={styles.createUserLoginFormContainer}>
        <form onSubmit={handleSubmit} className={styles.createUserLoginForm}>
          <input
            className={`${styles.createUserLoginEmail} ${styles.createUserLoginInput}`}
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={`${styles.createUserLoginPassword} ${styles.createUserLoginInput}`}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className={`${styles.createUserLoginRepeatPassword} ${styles.createUserLoginInput}`}
            type="password"
            placeholder="Repeat password"
            onChange={(e) => setRepeatPassword(e.target.value)}
          />

          <div className={styles.createUserRadioInput}>
            <label>
              <input
                type="radio"
                id="user"
                name="role-radio"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              <span>User</span>
            </label>
            {userRole === "admin" && (
              <>
                <label>
                  <input
                    type="radio"
                    id="admin"
                    name="role-radio"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                  />
                  <span>Admin</span>
                </label>
                <label>
                  <input
                    type="radio"
                    id="moderator"
                    name="role-radio"
                    value="moderator"
                    checked={role === "moderator"}
                    onChange={() => setRole("moderator")}
                  />
                  <span>Moderator</span>
                </label>
                <span className={styles.createUserSelection}></span>
              </>
            )}
          </div>
          <button
            className={`${styles.createUserLoginSubmit} ${styles.createUserLoginInput}`}
            type="submit"
          >
            Create Account
          </button>
        </form>
      </div>
      <h1 className={styles.createUserLoginH1}>
        Already have an account?{" "}
        <a className={styles.createUserLoginA} href="/login">
          Login
        </a>
      </h1>
      <Info />
    </>
  );
}