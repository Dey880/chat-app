const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

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
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const User = require("./models/user");
const Message = require("./models/message");
const Room = require("./models/room");
const authenticateJWT = require("./middleware/auth");

mongoose
  .connect("mongodb://localhost:27017/chat-app")
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
  res.send(
    "You have successfully entered the server, type any command to get started"
  );
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/rooms", authenticateJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const rooms = await Room.find({
      $or: [{ isPublic: true }, { invitedUsers: userId }],
    }).select("name description isPublic isOwner");
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/rooms", authenticateJWT, async (req, res) => {
  const { name, description, isPublic, invitedEmails } = req.body;
  const creatorId = req.userId;

  try {
    const user = await User.findById(creatorId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Allow normal users to create private rooms, but only admins can create public rooms.
    if (isPublic && user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create public rooms" });
    }

    const invitedUsers = [];
    for (const email of invitedEmails) {
      const invitedUser = await User.findOne({ email });
      if (invitedUser) {
        invitedUsers.push(invitedUser._id);
      }
    }

    if (!invitedUsers.includes(creatorId)) {
      invitedUsers.push(creatorId);
    }

    const newRoom = new Room({
      name,
      description,
      isPublic,
      invitedUsers,
      isOwner: creatorId,
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/rooms/invite", authenticateJWT, async (req, res) => {
  const { roomId, userId } = req.body;
  const inviterId = req.userId;

  try {
    const room = await Room.findById(roomId).populate("roles.user");

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const inviterRole = room.roles.find(
      (role) => role.user._id.toString() === inviterId
    )?.role;
    if (!["admin", "moderator"].includes(inviterRole)) {
      return res
        .status(403)
        .json({ error: "Only admins or moderators can invite users" });
    }

    if (!room.invitedUsers.includes(userId)) {
      room.invitedUsers.push(userId);
      room.roles.push({ user: userId, role: "member" });
      await room.save();
    }

    res.json({ message: "User invited successfully" });
  } catch (error) {
    console.error("Error inviting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/user", authenticateJWT, (req, res) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch((err) => {
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/api/proxy-profile-image", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url, { responseType: "stream" });
    res.setHeader("Content-Type", "image/svg+xml");
    response.data.pipe(res);
  } catch (error) {
    console.error("Error proxying the request:", error);
    res.status(500).json({ error: "Failed to fetch the image" });
  }
});

app.post("/api/user", (req, res) => {
  const { email, password, repeatPassword, role } = req.body;
  if (password === repeatPassword) {
    bcrypt.hash(password, saltRounds, async function (error, hash) {
      if (error) {
        return res.status(500).json({ error: "Error hashing password" });
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
        return res
          .status(201)
          .json({ message: "User created successfully", status: "login" });
      } catch (err) {
        return res.status(500).json({ error: "Error saving user" });
      }
    });
  } else {
    res.status(400).json({ error: "Passwords do not match" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    bcrypt
      .compare(password, user.password)
      .then((result) => {
        if (result) {
          const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );

          res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 604800000, // 7 days
            sameSite: "Lax",
          });

          return res.json({
            message: "User logged in successfully",
            status: "login",
            token,
          });
        } else {
          res.status(400).json({ error: "Passwords do not match" });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: "Internal server error" });
      });
  });
});

app.get("/api/rooms/:roomId", authenticateJWT, async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put(
  "/api/user",
  authenticateJWT,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { displayName, bio } = req.body;
      const uploadedImage = req.file ? `/uploads/${req.file.filename}` : null;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let profilePicture = user.profilePicture;

      if (uploadedImage) {
        if (
          user.profilePicture &&
          user.profilePicture.startsWith("/uploads/")
        ) {
          const oldPath = path.join(__dirname, user.profilePicture);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        profilePicture = uploadedImage;
      } else if (
        !user.profilePicture ||
        !user.profilePicture.startsWith("/uploads/")
      ) {
        const name = displayName || user.email;
        const apiUrl = `https://api.nilskoepke.com/profile-image/?name=${name}`;

        const response = await axios.get(apiUrl, { responseType: "stream" });
        const svgFileName = `uploads/${Date.now()}-${name.replace(
          /\s/g,
          "_"
        )}.svg`;
        const writeStream = fs.createWriteStream(svgFileName);

        await new Promise((resolve, reject) => {
          response.data.pipe(writeStream);
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        profilePicture = `/${svgFileName}`;
      }

      user.displayName = displayName || user.displayName;
      user.bio = bio || user.bio;
      user.profilePicture = profilePicture;

      const updatedUser = await user.save();

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

io.on("connection", (socket) => {
  socket.on("join-room", async (roomId) => {
    socket.join(roomId);

    try {
      const messages = await Message.find({ roomId })
        .populate("userId", "displayName profilePicture role")
        .sort({ createdAt: -1 });

      const formattedMessages = messages.map((msg) => ({
        message: msg.message,
        displayName: msg.userId?.displayName || "Detelet user", 
        profilePicture: msg.userId?.profilePicture || "/uploads/placeholder.jpg",
        createdAt: msg?.createdAt || "Deleted",
        role: msg.userId?.role || "Gone",
      }));

      socket.emit("previous-messages", formattedMessages.reverse());
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  socket.on("send-message", async (messageData) => {
    const { roomId, message, userId } = messageData;

    if (!userId) {
      console.error("Error: Missing userId");
      return;
    }

    const newMessage = new Message({
      roomId,
      message,
      userId,
    });

    try {
      const savedMessage = await newMessage.save();

      const populatedMessage = await savedMessage.populate(
        "userId",
        "displayName profilePicture email role"
      );

      io.to(roomId).emit("receive-message", {
        message: populatedMessage.message,
        displayName: populatedMessage.userId.displayName,
        profilePicture: populatedMessage.userId.profilePicture,
        userEmail: populatedMessage.userId.email,
        userId: populatedMessage.userId._id,
        role: populatedMessage.userId.role,
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });
});

app.use((req, res, next) => {
  res.status(404).send({ error: "Not Found" });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}, closing HTTP server...`);
  app.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
    } else {
      console.log("Server closed.");
    }
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  process.exit(1);
});