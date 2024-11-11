const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },  // Add email to the message schema
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);