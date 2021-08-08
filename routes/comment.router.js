const router = require("express").Router();
const { Comment } = require("../models/index");
// const { authVerify } = require("../middleware/index");
const authVerify = require("../middleware/authVerify");
const {
  getAllComments,
  crudComment,
  getAllReplies,
  createReply,
  toggleCommentLike,
} = require("../controllers/comment/index");

router.get("/", async (req, res) => {
  const comments = await Comment.find({});
  res.status(200).json({ success: true, comments });
});

router.get("/:videoId", getAllComments);
router.post("/:videoId", authVerify, crudComment);

router.get("/replies/:commentId", getAllReplies);

router.post("/reply/:commentId", authVerify, createReply);

router.post("/like/:commentId/:userId", authVerify, toggleCommentLike);

module.exports = router;
