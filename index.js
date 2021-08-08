require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const {
  videoRoutes,
  userRoutes,
  playlistRoutes,
  commentRoutes,
  searchRoutes,
  authRoutes,
} = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Server working fine :D" });
});

app.use("/videos", videoRoutes);
app.use("/users", userRoutes);
app.use("/playlists", playlistRoutes);
app.use("/comments", commentRoutes);
app.use("/search", searchRoutes);
app.use("/auth", authRoutes);

connectDB();

app.listen(process.env.PORT || 3000);
