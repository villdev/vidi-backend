const router = require("express").Router();

const { searchDb } = require("../controllers/search/index");

router.get("/search", searchDb);

module.exports = router;
