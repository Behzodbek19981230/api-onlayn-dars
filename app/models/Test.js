const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");
const User = require("./User");
const Test = db.define("tests", {
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
  createdBy: Sequelize.INTEGER,
});
Test.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});
Test.belongsTo(User, {
  as: "Users",
  foreignKey: "createdBy",
  onDelete: "CASCADE",
});

module.exports = Test;
