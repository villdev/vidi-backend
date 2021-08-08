const mongoose = require("mongoose");
const { Video, Comment } = require("../../models/index");

const getAllComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      res
        .status(404)
        .json({ success: false, message: "Could not find video!" });
    }
    const comments = await Comment.find({
      video: videoId,
      parentComment: null,
    })
      .populate("user", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving comments." });
  }
};

const crudComment = async (req, res) => {
  //add comment to video
  // edit comment / del comment
  try {
    const { videoId } = req.params;
    const { userId, commentText, action, commentId } = req.body;
    const video = await Video.findById(videoId);
    if (!video) {
      res
        .status(404)
        .json({ success: false, message: "Could not find video!" });
    }

    switch (action.type) {
      case "ADD_COMMENT": {
        const comment = new Comment({
          _id: new mongoose.Types.ObjectId(),
          user: userId,
          text: commentText,
          video: videoId,
        });
        if (!comment) {
          return res
            .status(404)
            .json({ success: false, message: "Could not add comment" });
        }
        video.comments.push(comment._id);
        const savedComment = await comment.save();
        const savedVideo = await video.save();
        if (!savedComment || !savedVideo) {
          return res
            .status(404)
            .json({ success: false, message: "Could not add comment" });
        }
        res.status(201).json({
          success: true,
          message: "Comment added.",
          comment: savedComment,
        });
        break;
      }
      case "DELETE_COMMENT": {
        const comment = await Comment.findByIdAndDelete(commentId);
        video.comments = video.comments.filter((c) => c !== commentId);
        const savedVideo = await video.save();
        // delete all replies if parent comment
        const childReplies = await Comment.deleteMany({
          parentComment: commentId,
        });
        res
          .status(200)
          .json({ success: true, message: "Deleted comment.", comment });
        break;
      }
      case "EDIT_COMMENT": {
        const comment = await Comment.findById(commentId);
        if (!comment) {
          res
            .status(404)
            .json({ success: false, message: "Comment not found." });
        }
        comment.text = commentText;
        const savedComment = await comment.save();
        if (!savedComment) {
          res
            .status(404)
            .json({ success: false, message: "Could not edit comment!" });
        }
        res.status(200).json({
          success: true,
          message: "Comment edited.",
          comment: savedComment,
        });
        break;
      }
      default:
        throw new Error("Specify correct comment action type.");
    }
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while adding comment." });
  }
};

const getAllReplies = async (req, res) => {
  //get all replies to a comment
  try {
    const { commentId } = req.params;
    const replies = await Comment.find({ parentComment: commentId })
      .populate("user", "username avatar")
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, replies });
    // todo: add pagination support later on
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Could not retrieve replies." });
  }
};

const createReply = async (req, res) => {
  //reply to a comment
  try {
    const { userId, action, commentText, videoId } = req.body;
    const { commentId } = req.params;
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res
        .status(404)
        .json({ success: false, message: "Error while adding reply." });
    }
    const comment = new Comment({
      _id: new mongoose.Types.ObjectId(),
      user: userId,
      text: commentText,
      video: videoId,
    });
    parentComment.totalReplies = parentComment.totalReplies + 1;
    const savedComment = await comment.save();
    const savedParentComment = await parentComment.save();
    if (!savedComment || !savedParentComment) {
      return res
        .status(404)
        .json({ success: false, message: "Error while adding reply." });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Error while adding reply." });
    }
    video.comments.push(savedComment);
    const savedVideo = await video.save();
    res.status(201).json({ success: true, message: "Reply added." });
  } catch (error) {
    console.error(error);
    res.status(404).json({ success: false, message: "Error adding reply." });
  }
};

const toggleCommentLike = async (req, res) => {
  //like comment
  try {
    const { commentId, userId } = req.params;
    const comment = await Comment.findById(commentId);
    const liked = comment.likedUsers.includes(userId);
    let message = "";
    if (liked) {
      comment.likedUsers = comment.likedUsers.filter((user) => user !== userId);
      message = "Removed like from comment.";
    } else {
      comment.likedUsers.push(userId);
      message = "Liked the comment.";
    }

    const savedComment = await comment.save();
    if (!savedComment) {
      return res
        .status(404)
        .json({ success: false, message: "Error while liking the comment!" });
    }
    res.status(200).json({
      success: true,
      message,
      comment: savedComment,
    });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while liking the comment!" });
  }
};

module.exports = {
  getAllComments,
  crudComment,
  getAllReplies,
  createReply,
  toggleCommentLike,
};
