const Sequelize = require("sequelize");
const db = require("../../config/db");

const Teacher = db.define("teachers", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: Sequelize.STRING,
  image: Sequelize.STRING,
  text: Sequelize.STRING,
});

module.exports = Teacher;
