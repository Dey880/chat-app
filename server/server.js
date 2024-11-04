const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { METHODS } = require("http");
const jwt = require("jsonwebtoken");

const app = express();

const User = require("./models/user");
const authenticateJWT = require("./middleware/auth");

mongoose.connect("mongodb://localhost:27017/chat-app")
  .then(() => {})
  .catch((error) => {
    console.log("something happened", error);
});

const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET, POST",
    credentials: true
}

const saltRounds = 10;

app.use(express.json())
app.use(cors(corsOptions))

app.get("/", (req, res) => {
    res.send("hallo")
})


app.post("/api/user", (req, res) => {
    const {email, password, repeatPassword} = req.body
    if(password == repeatPassword){
        bcrypt.hash(password, saltRounds, async function(error, hash) {
          let newUser = new User({email:email, password:hash})
          const result= await newUser.save();
      
          if(result._id) {
            const token = jwt.sign({ userId : result._id, email:result.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
            
            res.cookie("jwt", token, {
              httpOnly: true,
              secure: false,
              maxAge: 3600000,
            });
      
            res.send("login");
          }
        });
      } else {
        res.send('error=Passord stemmer ikke overens');
      }
})

app.listen(4000)