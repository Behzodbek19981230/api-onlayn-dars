require("dotenv").config();
const express = require("express");
const router = require("./app/routes");
const cors = require("cors");
const db = require("./config/db");
const server = express();
const PORT = 8000;
const ADDRESS = "127.0.0.1";
server.use(cors());
server.use(express.json());
server.use("/public", express.static(__dirname + "/public"));
server.use("/api", router);
server.get("/", (req, res) => {
  res.json({ info: "Server up and running" });
});

const start = async () => {
  try {
    db.sync();

    server.listen(PORT, ADDRESS, () => {
      console.log(`SERVER RUNNING ON PORT ${PORT}`);
    });
  } catch (error) {
    console.log("An error occurred while connecting to the database:", error);
  }
};
start();
