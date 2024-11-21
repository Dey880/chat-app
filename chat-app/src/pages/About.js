import React from 'react';
import styles from "../css/About.module.css"

export default function About() {
    return (
    <>
    <div className={styles.aboutParent}>
        <div className={styles.aboutDiv1}>
            <h1 className={styles.welcome}>Welcome To</h1>
        </div>
        <div className={styles.aboutDiv2}>
            <h1 className={styles.info}>Info About</h1>
        </div>
        <div className={styles.aboutDiv3}>
            <div className={styles.aboutInfoContainer}>
                <div className={styles.aboutInfoHeader}>
                    <div className={styles.aboutInfoImageContainer}>
                        <img className={styles.aboutImage} src='/img/gratisography-cyber-kitty-800x525 1.png' alt=''/>
                    </div>
                    <div className={styles.aboutInfoHead}>
                        <h1>Chat with no ads</h1>
                    </div>
                </div>
                <div className={styles.aboutInfoText}>
<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', <br/> <br/>

making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many </p>
                </div>
            </div>

        </div>
        <div className={styles.aboutDiv4}>
            <h1 className={styles.aboutH1}>CHATTER’N</h1>
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
        </div>
    </div>
    </>
    );
};