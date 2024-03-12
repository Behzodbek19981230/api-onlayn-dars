const ChapterControlled = require("../controllers/Chapter");

const route = require("express").Router();

route.get("/", ChapterControlled.getAllChapter);
route.post("/", ChapterControlled.addChapter);
route.delete("/:id", ChapterControlled.delete);

module.exports = route;
