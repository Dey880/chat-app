const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const User = require("./models/user");
const Message = require("./models/message");
const authenticateJWT = require("./middleware/auth");

mongoose.connect("mongodb://localhost:27017/chat-app")
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.log("Database connection error:", error));

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET, POST",
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

const saltRounds = 10;

console.log("THIS IS JULIAN BRANCH")

app.get("/", (req, res) => {
  res.send("hallo");
});

app.get("/api/user", authenticateJWT, (req, res) => {
  User.findById(req.userId)
  .then(user => {
    if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        })
        .catch(err => {
            res.status(500).json({ error: "Internal server error" });
        });
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

                  // Set the JWT cookie
                  res.cookie("jwt", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // set to true for HTTPS in production
                    maxAge: 3600000,  // 1 hour
                    sameSite: "Lax",
                  });

                  return res.json({ message: "User logged in successfully", status: "login", token });
              } else {
                  res.status(400).json({ error: 'Passwords do not match' });
              }
          }).catch((error) => {
            res.status(500).json({ error: 'Internal server error' });
          });
        });
});

app.put('/api/user', authenticateJWT, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.userId;
    const { displayName, bio } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    // Find the user by userId and update their profile
    const user = await User.findByIdAndUpdate(userId, {
      displayName,
      bio,
      profilePicture,
    }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.use((packet, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
        return next(new Error("Authentication error"));
    }
  
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {});
  
    const token = cookies.jwt;
    if (!token) {
        return next(new Error("Authentication error"));
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        socket.userId = user.userId;  // Attach user info
        socket.userEmail = user.email; // Attach email as well (if needed)
        next();
    });
  });
  

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  
    try {
      const messages = await Message.find({ roomId })
        .populate("userId", "email")  // Populate only the email field
        .sort({ createdAt: -1 });
  
      socket.emit("previous-messages", messages.reverse());
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });  

  socket.on("send-message", async (messageData) => {
    const { roomId, message, userId, userEmail } = messageData;
  
    if (!userId || !userEmail) {
      console.error("Error: Missing userId or userEmail");
      return;
    }
  
    const newMessage = new Message({
      roomId,
      message,
      userId,
      userEmail, // Save email directly in message
    });
  
    try {
      await newMessage.save();
      console.log("Message saved with email!");
  
      // Server-side - Emitting to all clients in the room
      io.to(roomId).emit("receive-message", {
        message: message,
        userEmail: userEmail,
        userId: userId
      });

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
    

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});