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
const fs = require('fs');
const axios = require('axios');

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
    cb(null, './uploads/');
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
    const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profilePicture;

    if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    if (uploadedImage) {
      profilePicture = uploadedImage;
    } else {
      const name = displayName || user.email;
      const apiUrl = `https://api.nilskoepke.com/profile-image/?name=${name}`;
      
      const response = await axios.get(apiUrl, { responseType: 'stream' });
      const svgFileName = `uploads/${Date.now()}-${name.replace(/\s/g, '_')}.svg`;
      const writeStream = fs.createWriteStream(svgFileName);

      await new Promise((resolve, reject) => {
        response.data.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      profilePicture = `/${svgFileName}`;
    }

    user.displayName = displayName || user.displayName;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


io.on("connection", (socket) => {

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);

    try {
      const messages = await Message.find({ roomId })
        .populate("userId", "email displayName")
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

    const user = await User.findById(userId);
    const displayName = user ? user.displayName : userEmail;

    const newMessage = new Message({
      roomId,
      message,
      userId,
      userEmail,
      displayName,
    });

    try {
      await newMessage.save();

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
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});