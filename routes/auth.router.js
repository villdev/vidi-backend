const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");
const Playlist = require("../models/playlist.model");

const { hashPassword, createToken, verifyPassword } = require("../utils/index");

// signup ? register ?
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await hashPassword(password);

    //check for existing username
    const existingUsername = await User.findOne({
      username: username,
    }).lean();

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
        error: "username",
      });
    }

    //check for existing email
    const existingEmail = await User.findOne({
      email: email,
    }).lean();

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        error: "email",
      });
    }

    //create user and add video to user
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // create empty liked, history and watchlater playlist for new user
    const likedVideos = new Playlist({
      _id: new mongoose.Types.ObjectId(),
      title: "Liked Videos",
      description: "",
      thumbnailURL: "https://i.ytimg.com/img/no_thumbnail.jpg",
      variant: "permanent",
      visibility: "private",
      curator: newUser._id,
    });
    const watchLater = new Playlist({
      _id: new mongoose.Types.ObjectId(),
      title: "Watch Later",
      description: "",
      thumbnailURL: "https://i.ytimg.com/img/no_thumbnail.jpg",
      variant: "permanent",
      visibility: "private",
      curator: newUser._id,
    });
    const userHistory = new Playlist({
      _id: new mongoose.Types.ObjectId(),
      title: "History",
      description: "",
      thumbnailURL: "https://i.ytimg.com/img/no_thumbnail.jpg",
      variant: "permanent",
      visibility: "private",
      curator: newUser._id,
    });
    const savedLikedVideos = await likedVideos.save();
    const savedWatchLater = await watchLater.save();
    const savedUserHistory = await userHistory.save();

    newUser.likedVideos = savedLikedVideos._id;
    newUser.watchLater = savedWatchLater._id;
    newUser.userHistory = savedUserHistory._id;

    const savedUser = await newUser.save();

    if (savedUser) {
      const token = createToken(savedUser);
      const userInfo = {
        // username: savedUser.username,
        ...savedUser._doc,
        password: undefined,
      };

      // ! cookie--------------------------------------------------->
      //   res.cookie('token', token, { path: '/', httpOnly: true });
      //   res.cookie('token', token, { httpOnly: true });

      return res.status(201).json({
        success: true,
        message: "Account created.",
        user: userInfo,
        token,
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Error while creating account!" });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "There was a problem creating your account.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    // const { email, password } = req.body;
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Wrong username or password." });
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (passwordValid) {
      const token = createToken(user);
      const userInfo = {
        // username: savedUser.username,
        ...user._doc,
        password: undefined,
      };

      // ! cookie--------------------------------------------------->
      //   res.cookie('token', token, { path: '/', httpOnly: true });
      //   res.cookie('token', token, { httpOnly: true });

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        user: userInfo,
        token,
      });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Wrong username or password." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error while logging in." });
  }
});

module.exports = router;
