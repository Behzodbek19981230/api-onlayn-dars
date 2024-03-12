const route = require("express").Router();
const PrepareTest = require("../controllers/Preparetest");

route.get("/", PrepareTest.getAllPrepareTest);
route.post("/", PrepareTest.generateTest);
route.post("/result", PrepareTest.getResult);

module.exports = route;
