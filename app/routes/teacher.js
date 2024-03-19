const route = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Teacher = require("../models/Teacher");
const upload = multer({ dest: "uploads/" }); // Specify the directory where uploaded files will be stored

route.get("/", Teacher.getAll);
route.post("/", auth, upload.single("image"), Teacher.add);
route.delete("/:id", auth, upload.single("file"), Teacher.delete);
route.put("/:id", auth, upload.single("file"), Teacher.edit);

module.exports = route;
