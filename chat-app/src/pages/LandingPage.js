import React from "react";
import styles from "../css/LandingPage.module.css";
import Info from "../components/Info.js";
import AboutButton from "../components/AboutButton.js";

export default function LandingPage() {
  return (
    <>
      <AboutButton />
      <div className={styles.LandingPage}>
        <h1 className={`${styles.welcome} ${styles.LandingPageH1}`}>
          Welcome to
        </h1>
        <hr className={styles.LandingPageHr} />
        <h1 className={`${styles.chattern} ${styles.LandingPageH1}`}>
          CHATTER’N
        </h1>
        <a href="/login" className={styles.loginA}>
          <button className={styles.loginButton}>Login</button>
        </a>
        <a href="/createuser" className={styles.signupA}>
          <button className={styles.signupButton}>Signup</button>
        </a>
        <Info />
      </div>
    </>
  );
}