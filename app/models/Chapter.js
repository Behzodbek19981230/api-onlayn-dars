// Chapter.js
const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");

const Chapter = db.define("chapters", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
  object: Sequelize.INTEGER,
});
Chapter.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});
module.exports = Chapter;
