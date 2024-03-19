const route = require("express").Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const TeacherController = require("../controllers/Teacher");
const upload = multer({ dest: "uploads/" }); // Specify the directory where uploaded files will be stored

route.get("/", TeacherController.get);
route.post("/", auth, upload.single("image"), TeacherController.add);
route.delete("/:id", auth, upload.single("file"), TeacherController.delete);
route.put("/:id", auth, upload.single("file"), TeacherController.edit);

module.exports = route;
