const route = require("express").Router();
const auth = require("../middleware/auth");
const LessonsLandingController = require("../controllers/LessonsLanding");

route.get("/", LessonsLandingController.getAll);
route.post("/", auth, LessonsLandingController.add);
route.delete("/:id", auth, LessonsLandingController.delete);
route.put("/:id", auth, LessonsLandingController.edit);

module.exports = route;
