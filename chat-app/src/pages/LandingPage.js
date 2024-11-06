import React from 'react';
import styles from '../css/LandingPage.module.css'

export default function LandingPage() {
    return (
        <>
        <div className={styles.aboutButtonContainer}>
            <a href='/about' className={styles.aboutA}>
                <button className={styles.aboutButton}> About us </button>
            </a>
        </div>
        <div className={styles.LandingPage}>
            <h1 className={`${styles.welcome} ${styles.LandingPageH1}`}>Welcome to</h1>
            <hr className={styles.LandingPageHr}/>
            <h1 className={`${styles.chattern} ${styles.LandingPageH1}`}>CHATTER’N</h1>
            <a href='/login' className={styles.loginA}>
                <button className={styles.loginButton}> 
                    Login
                </button>
            </a>
            <a href='/createuser' className={styles.signupA}>
                <button className={styles.signupButton}> 
                    Signup
                </button>
            </a>
            <div className={styles.infoContainer}>
                <h2 className={styles.infoH2}>Bla info bla bla</h2>
                <div className={styles.infoDivContainer}>
                    <div className={`${styles.infoDiv1} ${styles.infoDiv}`}></div>
                    <div className={`${styles.infoDiv2} ${styles.infoDiv}`}></div>
                </div>
            </div>
        </div>
        </>
    );
};