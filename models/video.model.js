const { Schema, model } = require("mongoose");

const videoSchema = new Schema(
  {
    title: { type: String, required: [true, "Title of video missing."] },
    url: {
      type: String,
      required: [true, "YT Video url required"],
      unique: true,
    },
    ytId: { type: String },
    duration: { type: Number, required: true },
    thumbnailURL: { type: String, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    views: { type: Number, required: true, default: 0 },
    // likes: { type: Number, required: true, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }],
    // _uploadDate: { type: Date },
    tags: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = model("Video", videoSchema);
