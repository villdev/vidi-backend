const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, required: true, default: "defaultAvatar" },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    followers: { type: Number, required: true, default: 0 },
    playlists: [{ type: Schema.Types.ObjectId, ref: "Playlist" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // likedVideos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    // history: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    likedVideos: { type: Schema.Types.ObjectId, ref: "Playlist" },
    watchLater: { type: Schema.Types.ObjectId, ref: "Playlist" },
    userHistory: { type: Schema.Types.ObjectId, ref: "Playlist" },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
