const { Schema, model } = require("mongoose");

const playlistSchema = new Schema(
  {
    title: { type: String, required: [true, "Title of playlist missing."] },
    description: { type: String },
    thumbnailURL: { type: String, required: true },
    // variant -> permanent (wl, lv, uh), userCustom (user created playlist)
    variant: { type: String, required: true },
    // visibility -> private, public
    visibility: { type: String, required: true },
    curator: { type: Schema.Types.ObjectId, ref: "User" },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    views: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("Playlist", playlistSchema);
