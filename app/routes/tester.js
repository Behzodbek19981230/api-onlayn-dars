const route = require("express").Router();
const Tester = require("../controllers/Tester");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // Specify the directory where uploaded files will be stored

route.get("/", Tester.getAllTester);
route.post("/", Tester.addTester);
route.delete("/:id", Tester.delete);
route.patch("/:id", Tester.editTester);

module.exports = route;
