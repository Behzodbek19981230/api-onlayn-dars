// Subject.js
const Sequelize = require("sequelize");
const db = require("../../config/db");

const Subject = db.define("subjects", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
});

module.exports = Subject;
