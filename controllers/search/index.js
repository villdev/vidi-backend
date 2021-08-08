const mongoose = require("mongoose");
const { Video, User, Playlist } = require("../../models/index");

const searchDb = async (req, res) => {
  try {
    //pagination
    const page = parseInt(req.query.page);
    const results = parseInt(req.query.results);
    const sort = req.query.sort;
    let sortQuery = {};
    const startIndex = (page - 1) * results;
    const endIndex = page * results;

    const searchRegex = req.query.s ?? "";
    let searchQuery = {};

    if (searchRegex !== "") {
      searchQuery = { $regex: searchRegex, $options: "i" };
    }

    const videoResults = await Video.find({ title: searchQuery });
    const playlistResults = await Playlist.find({ title: searchQuery });
    const channelResults = await User.find({ username: searchQuery });
    //   .sort(sortQuery)
    //   .limit(results)
    //   .skip(startIndex);

    // * maybe do it using below method: promise.all
    // var promises = [];
    // promises.push(Collection1.find({title : "title",desription : "description",...}).lean().exec());
    // promises.push(Collection1.find({title : "title",desription : "description",...}).lean().exec());
    // promises.push(Collection1.find({title : "title",desription : "description",...}).lean().exec());

    // Promise.all(promises).then(results=>{
    //     // results[0] will have docs of first query
    //     // results[1] will have docs of second query
    //     // and so on...

    //     // you can combine all the results here and send back in response
    // }).catch(err=>{
    //     //handle error here
    // })

    res.status(200).json({ message: "Work in progress..." });
  } catch (error) {
    console.error(error);
    res
      .status(404)
      .json({ success: false, message: "Error while performing search!" });
  }
};

module.exports = { searchDb };
