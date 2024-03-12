const route = require("express").Router();
const User = require("../controllers/User");
const auth = require("../middleware/auth");

route.post("/register", User.register);
route.post("/login", User.login);
route.get("/me", auth, User.profile);
route.get("/", User.getAllUsers);
route.delete("/:id", User.delete);
route.get("/:id", auth, User.getByIdUser);

module.exports = route;
