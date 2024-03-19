const route = require("express").Router();
const Banner = require("../controllers/Banner");
const multer = require("multer");
const auth = require("../middleware/auth");
const upload = multer({ dest: "uploads/" }); // Specify the directory where uploaded files will be stored

route.get("/", Banner.getAll);
route.post("/", auth, upload.single("image"), Banner.add);
route.delete("/:id", auth, upload.single("file"), Banner.delete);
route.put("/:id", auth, upload.single("file"), Banner.edit);

module.exports = route;
