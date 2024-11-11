import React from 'react';
import styles from '../css/AboutButton.module.css'

export default function AboutButton() {
    return (
        <div className={styles.aboutButtonContainer}>
            <a href='/about' className={styles.aboutA}>
                <button className={styles.aboutButton}> About us </button>
            </a>
        </div>
    )
}