/** @format */

const route = require("express").Router();
const Object = require("../controllers/Object");

route.get("/", Object.getAllObject);
route.post("/", Object.addObjects);
route.delete("/:id", Object.delete);
route.put("/:id", Object.editObject);

module.exports = route;
