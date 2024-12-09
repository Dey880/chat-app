const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "moderator"], default: "user" },
  displayName: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
  pinnedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
});

module.exports = mongoose.model("User", userSchema);