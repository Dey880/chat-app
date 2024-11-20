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
    methods: ["GET", "POST", "PUT", "DELETE", ],
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
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.options("*", cors(corsOptions));

const saltRounds = 10;

app.get("/", (req, res) => {
  res.send("You have successfully entered the server, type any command to get started")
})

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
              console.log(token)
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
                    secure: process.env.NODE_ENV === 'production',
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

  // Event listener for when a user joins a room
  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    try {
      // Fetch previous messages for the room
      const messages = await Message.find({ roomId })
        .populate("userId", "email displayName") // Populate the userId with email and displayName
        .sort({ createdAt: -1 }); // Sort by creation date in descending order

      console.log("Previous messages:", messages); // Log the previous messages
      socket.emit("previous-messages", messages.reverse()); // Send the previous messages to the user
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  // Event listener for sending a new message
  socket.on("send-message", async (messageData) => {
    const { roomId, message, userId, userEmail } = messageData;

    if (!userId || !userEmail) {
      console.error("Error: Missing userId or userEmail");
      return;
    }

    // Retrieve the user's displayName from the User model
    const user = await User.findById(userId);
    const displayName = user ? user.displayName : userEmail; // Fallback to email if no displayName

    const newMessage = new Message({
      roomId,
      message,
      userId,
      userEmail,
      displayName, // Set displayName from the user model
    });

    try {
      await newMessage.save();
      console.log("Message saved:", newMessage); // Log the saved message

      // Emit the message to all users in the room
      io.to(roomId).emit("receive-message", {
        message: message,
        userEmail: userEmail,
        displayName: displayName,
        userId: userId,
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