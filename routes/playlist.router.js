const router = require("express").Router();

// const { authVerify } = require("../middleware/index");
const authVerify = require("../middleware/authVerify");
const {
  findPlaylists,
  createPlaylist,
  getPlaylist,
  crudPlaylist,
  getUserPlaylists,
} = require("../controllers/playlist/index");

router.get("/", findPlaylists);
router.post("/", authVerify, createPlaylist);

router.get("/:playlistId", getPlaylist);
router.post("/:playlistId", authVerify, crudPlaylist);

router.get("/user/:userId", authVerify, getUserPlaylists);

// router
//   .route("/wl")
//   .get(async (req, res) => {})
//   .post(async (req, res) => {});

// router
//   .route("/lv")
//   .get(async (req, res) => {})
//   .post(async (req, res) => {});

// router
//   .route("/uh")
//   .get(async (req, res) => {})
//   .post(async (req, res) => {});

module.exports = router;
