const mongoose = require("mongoose");
const { Video, User, Playlist } = require("../../models/index");
const videoData = require("../../videoData");
const { extend } = require("../../utils/index");

const findVideos = async (req, res) => {
  try {
    //* infinite loading
    const page = parseInt(req.query.page);
    const results = parseInt(req.query.results);
    const startIndex = (page - 1) * results;
    // const endIndex = page * results;

    //*   tag query
    const tagQuery = req.query.tag ?? "";

    //* sort query
    // relevance (default), upload date, view count, likes
    const sort = req.query.sort;
    const sortQuery = {};

    //* filter queries
    // upload: today, last hour, this week, this month, this year
    // type: video, channel, playlist
    // duration: under 4 min, 4-20 min, over 20 min
    // const

    //* search query
    const searchRegex = req.query.s ?? "";

    const query = {};
    if (tagQuery !== "") {
      query.tags = { $in: tagQuery };
    }

    const allResults = await Video.find(query).lean();
    // console.log(allResults).length;
    // console.log(allResults.length);

    // add sort, filter queries...

    const videos = await Video.find(query)
      .limit(results)
      .skip(startIndex)
      .populate("uploader", "username followers avatar")
      .select("-description -comments");
    res
      .status(200)
      .json({ success: true, videos, totalResults: allResults.length });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving videos!" });
  }
};

const createVideo = async (req, res) => {
  const { userId, video } = req.body;
  try {
    const userPresent = await User.findById(userId);
    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title: video.title,
      url: video.url,
      ytId: video.ytId,
      duration: video.duration,
      thumbnailURL: video.thumbnailURL,
      uploader: userPresent._id,
      description: video.description,
      views: 0,
      likes: 0,
      tags: video.tags,
    });
    const savedVideo = await newVideo.save();
    if (!savedVideo) {
      return res
        .status(500)
        .json({ success: false, message: "Could not upload the video." });
    }
    userPresent.videos.push(savedVideo._id);
    const savedUser = await userPresent.save();
    if (!savedUser) {
      const removedVideo = await Video.findOneAndDelete({
        id: savedVideo._id,
      });
      return res
        .status(500)
        .json({ success: false, message: "Could not upload the video." });
    }
    res
      .status(201)
      .json({ success: true, video: savedVideo, message: "Video uploaded" });
  } catch (error) {
    console.error(error);
    res.status(+error.code).json({
      success: false,
      message: "Failed to add video to channel.",
    });
  }
};

const getVideo = async (req, res) => {
  try {
    res.status(200).json({ success: true, video: req.video });
  } catch (error) {
    console.error(error);
    res
      .status(+error.code)
      .json({ success: false, message: "Error in loading video" });
  }
};

const crudVideo = async (req, res) => {
  try {
    const { updatedVideoDetails, userId, action } = req.body;
    const { videoId } = req.params;
    let videoFound = await Video.findById(videoId)
      // .populate("uploader", "username followers")
      .populate("comments");
    if (!videoFound) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found!" });
    }
    // if (videoFound.uploader._id !== userId) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Cannot access this video!" });
    // }
    switch (action.type) {
      case "EDIT_DETAILS": {
        // videoFound = { ...videoFound, ...updatedVideoDetails };
        // using extend lodash -> to access .save()
        videoFound = extend(videoFound, updatedVideoDetails);
        const savedVideo = await videoFound.save();
        if (!savedVideo) {
          return res.status(500).json({
            success: false,
            message: "Could not edit the video details.",
          });
        }
        res
          .status(200)
          .json({ message: "Video details edited.", video: savedVideo });
        break;
      }
      case "DELETE_VIDEO": {
        const uploader = await User.findById(videoFound.uploader);
        uploader.videos = uploader.videos.filter((video) => video !== videoId);
        const updatedUser = await uploader.save();
        if (!updatedUser) {
          return res
            .status(404)
            .json({ success: false, message: "Could not delete!" });
        }
        const deletedVid = await Video.findByIdAndDelete(videoId);
        if (!deletedVid) {
          return res
            .status(404)
            .json({ success: false, message: "Could not delete!" });
        }
        res.status(200).json({
          success: true,
          message: "Video deleted.",
          video: deletedVid,
        });
        break;
      }
      default:
        throw new Error("Specify action type!");
    }
  } catch (error) {
    console.error(error);
    res.status(+error.code).json({
      success: false,
      message: "Failed to edit video details.",
    });
  }
};

const toggleVideoLike = async (req, res) => {
  try {
    const { videoId, userId } = req.params;
    //* should i send likedPlaylistId in body or get it from user.liked  ??????
    const { likedPlaylistId } = req.body;
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Error while liking the video!" });
    }

    const liked = video.likes.includes(userId);
    // console.log(liked);
    let message = "";

    const likedPlaylist = await Playlist.findById(likedPlaylistId);
    // console.log(likedPlaylist);

    if (liked) {
      video.likes = video.likes.filter((user) => user != userId);
      console.log(video.likes);
      likedPlaylist.videos = likedPlaylist.videos.filter(
        (video) => video !== videoId
      );
      message = "Removed from liked videos.";
    } else {
      video.likes.push(userId);
      likedPlaylist.videos.push(videoId);
      message = "Added to liked videos.";
    }

    const savedLikedPlaylist = await likedPlaylist.save();
    // console.log(savedLikedPlaylist);
    const savedVideo = await video.save();

    if (!savedLikedPlaylist || !savedVideo) {
      return res.status(404).json({
        success: false,
        message: "Error while adding to liked videos.",
      });
    }

    res.status(200).json({ success: true, message, isLiked: !liked });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while liking the video!" });
  }
};

const setupVideoDb = async (req, res) => {
  try {
    // videoData.forEach(async (video) => {

    for (let i = 0; i < videoData.length; i++) {
      const video = videoData[i];

      const videoPresent = await Video.findOne({ title: video.title });
      if (videoPresent) return;
      const userPresent = await User.findOne({ username: video.uploader });
      if (userPresent) {
        //add video to that user
        const newVideo = new Video({
          _id: new mongoose.Types.ObjectId(),
          title: video.title,
          url: video.url,
          ytId: video.ytId,
          duration: video.duration,
          thumbnailURL: video.thumbnailURL,
          uploader: userPresent._id,
          description: video.description,
          views: 0,
          // likes: 0,
          tags: video.tags,
        });
        const savedVideo = await newVideo.save();
        if (!savedVideo) {
          res
            .status(500)
            .json({ success: false, message: "Could not upload the video." });
        }
        userPresent.videos.push(savedVideo._id);
        const savedUser = await userPresent.save();
        if (!savedUser) {
          const removedVideo = await Video.findOneAndDelete({
            id: savedVideo._id,
          });
          res
            .status(500)
            .json({ success: false, message: "Could not upload the video." });
        }
      } else {
        //create user and add video to user
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          username: video.uploader,
          email: `${video.uploader.replace(/\s+/g, "")}@gmail.com`,
          password: "qwerty01",
          avatar: video.avatar,
          followers: 0,
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
        if (!savedUser) {
          res
            .status(500)
            .json({ success: false, message: "Could not upload the video." });
        }

        const newVideo = new Video({
          _id: new mongoose.Types.ObjectId(),
          title: video.title,
          url: video.url,
          ytId: video.ytId,
          duration: video.duration,
          thumbnailURL: video.thumbnailURL,
          uploader: savedUser._id,
          description: video.description,
          views: 0,
          // likes: 0,
          tags: video.tags,
        });
        const savedVideo = await newVideo.save();
        if (!savedVideo) {
          const removedUser = await User.findOneAndDelete({
            id: savedUser._id,
          });
          res
            .status(500)
            .json({ success: false, message: "Could not upload the video." });
        }
        savedUser.videos.push(savedVideo._id);
        const modifiedUser = await savedUser.save();
        if (!modifiedUser) {
          const removedUser = await User.findOneAndDelete({
            id: savedUser._id,
          });
          const removedVideo = await Video.findOneAndDelete({
            id: savedVideo._id,
          });
          res
            .status(500)
            .json({ success: false, message: "Could not upload the video." });
        }
      }
    }
    // });
    res.status(201).json({
      success: true,
      message: "Successfully added all videos to the database.",
    });
  } catch (error) {
    console.error(error);
    res.status(+error.code).json({
      success: false,
      message: "Failed to add all videos to database.",
    });
  }
};

module.exports = {
  findVideos,
  createVideo,
  getVideo,
  crudVideo,
  toggleVideoLike,
  setupVideoDb,
};
