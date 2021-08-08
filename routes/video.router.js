const router = require("express").Router();
const { Video } = require("../models/index");
// const { authVerify } = require("../middleware/index.js");
const authVerify = require("../middleware/authVerify");

const {
  findVideos,
  createVideo,
  getVideo,
  crudVideo,
  toggleVideoLike,
  setupVideoDb,
} = require("../controllers/video/index");

router.param("videoId", async (req, res, next, videoId) => {
  try {
    const videoFound = await Video.findById(videoId)
      .populate("uploader", "username followers avatar")
      .populate("comments");
    if (!videoFound) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found!" });
    }
    req.video = videoFound;
    // todo: collect tags user interested in from videoFound.tags------------------
    next();
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving video!" });
  }
});

router.get("/", findVideos);
router.post("/", authVerify, createVideo);

router.get("/:videoId", getVideo);
router.post("/:videoId", authVerify, crudVideo);

router.post("/like/:videoId/:userId", authVerify, toggleVideoLike);

router.post("/setup/videoData", setupVideoDb);

module.exports = router;
