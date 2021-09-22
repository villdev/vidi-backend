const mongoose = require("mongoose");
const { User, Video } = require("../../models/index");

const findChannels = async (req, res) => {
  try {
    //* infinite loading
    const page = parseInt(req.query.page);
    const results = parseInt(req.query.results);
    const startIndex = (page - 1) * results;
    // const endIndex = page * results;

    //* sort query
    // relevance (default), followers
    const sort = req.query.sort;
    const sortQuery = {};

    //* search query
    const searchRegex = req.query.s ?? "";

    const query = {};
    // if (tagQuery !== "") {
    //   query.tags = { $in: tagQuery };
    // }
    //! add sort, filter, search to query like aboce...

    const users = await User.find(query)
      .limit(results)
      .skip(startIndex)
      .select("-email -password -videos -playlists -following");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving users!" });
  }
};

const getChannelDetails = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.error(error);
    res
      .status(+error.code)
      .json({ success: false, message: "Error in loading user" });
  }
};

const editChannelDetails = () => {};

const toggleChannelFollow = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    const channel = await User.findById(channelId);
    const user = await User.findById(userId);
    const following = user.following.includes(channelId);
    // unfollow if already following
    if (following) {
      user.following = user.following.filter(
        (followingChannel) => followingChannel !== channelId
      );
      channel.followers = channel.followers - 1;
    }
    // follow if not following
    else {
      user.following.push(channelId);
      channel.followers = channel.followers + 1;
    }
    const savedUser = await user.save();
    const savedChannel = await channel.save();
    if (!savedUser || !savedChannel) {
      return res.status(404).json({
        success: false,
        message: following ? "Could not unfollow!" : "Could not follow!",
      });
    }
    res
      .status(200)
      .json({ success: true, message: following ? "Unfollowed" : "Followed" });
  } catch (error) {
    console.error(error);
    res
      .status(+error.code)
      .json({ success: false, message: "Could not follow user!" });
  }
};

const getUserAccountDetails = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userFound = await User.findById(accountId)
      //   .populate("videos")
      //   .populate("playlists")
      //   .populate("following", "username followers avatar")
      .select("-videos -playlists -following");
    if (!userFound) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    res.status(200).json({ success: true, user: userFound });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving user!" });
  }
};

const editUserAccountDetails = () => {};

const getUserVideoDetails = async (req, res) => {
  try {
    const { userId, videoId } = req.params;
    const videoFound = await Video.findById(videoId).select("uploader");
    const userFound = await User.findById(userId)
      .select("following likedVideos watchLater userHistory playlists")
      .populate("likedVideos", "title videos")
      .populate("watchLater", "title videos")
      .populate("userHistory", "title videos")
      .populate("playlists", "_id title videos");
    if (!userFound) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }
    const isVideoLiked = userFound.likedVideos.videos.includes(videoId);
    const isChannelFollowed = userFound.following.includes(videoFound.uploader);
    const isPresentInWatchLater = userFound.watchLater.videos.includes(videoId);
    const playlistsStatus = userFound.playlists.map((pl) => {
      const temp = {
        title: pl.title,
        id: pl._id,
        isVideoPresent: false,
      };
      if (pl.videos.includes(videoId)) {
        temp.isVideoPresent = true;
      }
      return temp;
    });

    res.status(200).json({
      success: true,
      isVideoLiked,
      isChannelFollowed,
      isPresentInWatchLater,
      playlistsStatus,
    });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving user!" });
  }
};

module.exports = {
  findChannels,
  getChannelDetails,
  editChannelDetails,
  toggleChannelFollow,
  getUserAccountDetails,
  editUserAccountDetails,
  getUserVideoDetails,
};
