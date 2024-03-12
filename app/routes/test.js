/** @format */

const route = require("express").Router();
const Test = require("../controllers/Test");
const multer = require("multer");
const auth = require("../middleware/auth");
const upload = multer({ dest: "uploads/" }); // Specify the directory where uploaded files will be stored

route.get("/", Test.getAllTest);
route.post("/", Test.addTest);
route.delete("/:id", Test.delete);
route.patch("/:id", Test.editTest);
route.post("/excel", auth, upload.single("file"), Test.addTestFromExcel);
route.post("/test", auth, upload.single("file"), Test.addTestSimple);

module.exports = route;
