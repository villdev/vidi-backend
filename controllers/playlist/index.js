const mongoose = require("mongoose");
const { Playlist, User } = require("../../models/index");

const findPlaylists = async (req, res) => {
  try {
    //* infinite loading
    const page = parseInt(req.query.page);
    const results = parseInt(req.query.results);
    const startIndex = (page - 1) * results;
    // const endIndex = page * results;

    //* sort query
    // relevance (default), views
    const sort = req.query.sort;
    const sortQuery = {};

    //* search query
    const searchRegex = req.query.s ?? "";

    const query = { visibility: "private" };
    // if (tagQuery !== "") {
    //   query.tags = { $in: tagQuery };
    // }
    //! add sort, filter, search to query like aboce...

    const playlists = await Playlist.find(query)
      .limit(results)
      .skip(startIndex)
      //   .populate("videos")
      .populate("curator", "username avatar followers");
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving playlists!" });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const { userId, playlist, videoId } = req.body;
    const user = await User.findById(userId);
    const newPlaylist = new Playlist({
      _id: new mongoose.Types.ObjectId(),
      title: playlist.title,
      description: playlist.description || "",
      thumbnailURL: playlist.thumbnailURL || "",
      variant: "userCustom",
      visibility: playlist.visibility,
      curator: userId,
      videos: [videoId],
    });
    const savedPlaylist = await newPlaylist.save();
    if (!savedPlaylist) {
      return res
        .status(404)
        .json({ success: false, message: "Failed to create playlist" });
    }
    user.playlists.push(savedPlaylist._id);
    const savedUser = await user.save();
    if (!savedUser) {
      const removedPlaylist = await Playlist.findByIdAndDelete(
        savedPlaylist._id
      );
      return res
        .status(404)
        .json({ success: false, message: "Failed to create playlist" });
    }
    res.status(201).json({
      success: true,
      message: "Added to playlist",
      playlist: savedPlaylist,
    });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Could not create playlist!" });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId)
      .populate("curator", "username avatar followers")
      // .populate("videos", "title url ytId duration thumbnailURL uploader")
      .populate({
        path: "videos",
        select: "-comments -tags -likes -description",
        populate: {
          path: "uploader",
          select: "username avatar followers",
        },
      });

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    res.status(200).json({ success: true, playlist });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error retrieving playlist." });
  }
};

const crudPlaylist = async (req, res) => {
  try {
    const { userId, action, videoId, title, description } = req.body;
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    const user = await User.findById(userId);
    if (!playlist || !user) {
      return res
        .status(404)
        .json({ success: false, message: "Error while editing playlist." });
    }

    let message = "";
    switch (action.type) {
      case "ADD_VIDEO": {
        playlist.videos.push(videoId);
        message = "Video added to playlist.";
        break;
      }
      case "REMOVE_VIDEO": {
        playlist.videos = playlist.videos.filter((video) => video !== videoId);
        console.log(playlist._id);
        console.log(playlist.videos);
        message = "Video removed from playlist";
        break;
      }
      case "UPDATE_VISIBILITY": {
        playlist.visibility = visibility;
        message = "Playlist visibility updated.";
        break;
      }
      case "DELETE_PLAYLIST": {
        if (playlist.variant === "permanent") {
          return res
            .status(404)
            .json({ success: false, message: "Cannot delete!!" });
        }
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
        if (!deletedPlaylist) {
          return res
            .status(404)
            .json({ success: false, message: "Could not delete playlist." });
        }
        user.playlists = user.playlists.filter((pl) => pl !== playlistId);
        const savedUser = await user.save();
        message = "Playlist deleted.";
        break;
      }
      case "UPDATE_TITLE": {
        if (playlist.variant === "permanent") {
          return res
            .status(404)
            .json({ success: false, message: "Cannot edit!!" });
        }
        playlist.title = title;
        message = "Title updated.";
        break;
      }
      case "UPDATE_DESCRIPTION": {
        if (playlist.variant === "permanent") {
          return res
            .status(404)
            .json({ success: false, message: "Cannot edit!!" });
        }
        playlist.description = description;
        message = "Description updated.";
        break;
      }
      default:
        throw new Error("Use correct playlist action type!!");
    }
    const savedPlaylist = await playlist.save();
    if (!savedPlaylist) {
      return res
        .status(404)
        .json({ success: false, message: "Error while performing action." });
    }
    res.status(200).json({ success: true, message, playlist: savedPlaylist });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Could not edit playlist!" });
  }
};

const getUserPlaylists = async (req, res) => {
  try {
    // const { userId } = req.body;
    const { userId } = req.params;
    const playlists = await Playlist.find({
      curator: userId,
      variant: "userCustom",
    });
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while retrieving playlists!" });
  }
};

module.exports = {
  findPlaylists,
  createPlaylist,
  getPlaylist,
  crudPlaylist,
  getUserPlaylists,
};
