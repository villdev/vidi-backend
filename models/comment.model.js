const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    video: { type: Schema.Types.ObjectId, ref: "Video" },
    parentComment: { type: String, required: true, default: null },
    totalReplies: { type: Number, required: true, default: 0 },
    likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
