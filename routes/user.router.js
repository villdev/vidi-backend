const router = require("express").Router();
const { User } = require("../models/index");
// const { authVerify } = require("../middleware/index");
const authVerify = require("../middleware/authVerify");
const {
  findChannels,
  getChannelDetails,
  editChannelDetails,
  toggleChannelFollow,
  getUserAccountDetails,
  editUserAccountDetails,
} = require("../controllers/user/index");

router.param("userId", async (req, res, next, userId) => {
  try {
    const userFound = await User.findById(userId)
      .populate("videos")
      //   .populate("playlists")
      .populate("following", "username followers avatar")
      .select("-email -password");
    if (!userFound) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    req.user = userFound;
    next();
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving user!" });
  }
});

router.get("/", findChannels);

router.get("/:userId", getChannelDetails);
router.post("/:userId", editChannelDetails);

router.post("/follow/:channelId", authVerify, toggleChannelFollow);

router.get("/account/:accountId", authVerify, getUserAccountDetails);
router.post("/account/:accountId", authVerify, editUserAccountDetails);

module.exports = router;
