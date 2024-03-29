/** @format */

const route = require("express").Router();
const Role = require("../controllers/Role");

route.get("/", Role.getAllRole);
route.post("/", Role.addRoles);
route.delete("/:id", Role.delete);
route.put("/:id", Role.editRole);

module.exports = route;
