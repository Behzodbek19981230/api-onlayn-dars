const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");
const User = require("./User");
const Chapter = require("./Chapter");
const Theme = require("./Theme");

const Quiz = db.define("Quizs", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This makes it auto-incrementing
  },
  title: Sequelize.STRING,
  case1: Sequelize.STRING,
  case2: Sequelize.STRING,
  case3: Sequelize.STRING,
  case4: Sequelize.STRING,
  object: Sequelize.INTEGER,
  chapter: Sequelize.INTEGER,
  theme: Sequelize.INTEGER,
  createdBy: Sequelize.INTEGER,
});
Quiz.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});
Quiz.belongsTo(User, {
  as: "Users",
  foreignKey: "createdBy",
  onDelete: "CASCADE",
});
Quiz.belongsTo(Chapter, {
  as: "chapters",
  foreignKey: "chapter",
  onDelete: "CASCADE",
});
Quiz.belongsTo(Theme, {
  as: "themes",
  foreignKey: "theme",
  onDelete: "CASCADE",
});
module.exports = Quiz;
