const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
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
};

app.use(cors(corsOptions));


const saltRounds = 10;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hallo");
});

app.post("/api/user", (req, res) => {
  const { email, password, repeatPassword, role } = req.body;
  if (password === repeatPassword) {
      bcrypt.hash(password, saltRounds, async function(error, hash) {
          if (error) {
              return res.status(500).json({ error: 'Error hashing password' });
          }
          let newUser = new User({ email: email, password: hash, role: role });
          try {
              const result = await newUser.save();
              const token = jwt.sign(
                  { userId: result._id, email: result.email, role: role },
                  process.env.JWT_SECRET,
                  { expiresIn: "1h" }
              );
              res.cookie("jwt", token, {
                  httpOnly: true,
                  secure: false,
                  maxAge: 3600000,
              });
              return res.status(201).json({ message: "User created successfully", status: "login" });
          } catch (err) {
              return res.status(500).json({ error: 'Error saving user' });
          }
      });
  } else {
      res.status(400).json({ error: 'Passwords do not match' });
  }
});


app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
      .then((user) => {
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }


          bcrypt.compare(password, user.password).then((result) => {
              if (result) {
                  const token = jwt.sign(
                      { userId: user._id, email: user.email, role: user.role },
                      process.env.JWT_SECRET,
                      { expiresIn: "1h" }
                  );

                  res.cookie("jwt", token, {
                      httpOnly: true,
                      secure: false,
                      maxAge: 3600000,
                      sameSite: "Lax"
                  });
                  return res.json({ message: "User logged in successfully", status: "login", token }); // Include token
              } else {
                  res.status(400).json({ error: 'Passwords do not match' });
              }
          })
          .catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
          });
        });
});


app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
