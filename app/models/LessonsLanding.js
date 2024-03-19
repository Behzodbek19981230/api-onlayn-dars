const Sequelize = require("sequelize");
const db = require("../../config/db");

const LessonsLanding = db.define("lessonsLandings", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
  text: Sequelize.STRING,
});

module.exports = LessonsLanding;
