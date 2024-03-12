// Chapter.js
const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");
const User = require("./User");

const Course = db.define("courses", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user: Sequelize.STRING,
  object: Sequelize.INTEGER,
});
Course.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});
Course.belongsTo(User, {
  as: "users",
  foreignKey: "user",
  onDelete: "CASCADE",
});
module.exports = Course;
