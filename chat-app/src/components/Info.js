import React from 'react';
import styles from '../css/Info.module.css'

export default function Info() {
    return (
        <div className={styles.infoContainer}>
            <h2 className={styles.infoH2}>Bla info bla bla</h2>
            <div className={styles.infoDivContainer}>
                <div className={`${styles.infoDiv1} ${styles.infoDiv}`}></div>
                <div className={`${styles.infoDiv2} ${styles.infoDiv}`}></div>
            </div>
        </div>
    )
}