import React, { useState } from 'react';
import axios from "axios";

export default function CreateUser() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [repeatPassword, setRepeatPassword] = useState();


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
        axios.post("http://localhost:4000/api/user", 
            {
                email: email, 
                password: password, 
                repeatPassword: repeatPassword
            }).then((response) => {
                console.log(response);
            }).catch((error => {
                console.log("error", error);
            }));
    }

    return (
        <>
            <h1>Create User</h1>

            <form onSubmit={handleSubmit}> 
                <input type='email'placeholder='email' onChange={(e) => {setEmail(e.target.value)}}/>
                <input type='password'placeholder='password' onChange={(e) => {setPassword(e.target.value)}}/>
                <input type='password'placeholder='repeat password' onChange={(e) => {setRepeatPassword(e.target.value)}}/>
                <button> Register User</button>
            </form>
        </>
    );
};