const Sequelize = require("sequelize");
const db = require("../../config/db");
const Chapter = require("./Chapter");

const Theme = db.define("themes", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This makes it auto-incrementing
  },
  name: Sequelize.STRING,
  chapter: Sequelize.INTEGER,
  video: Sequelize.STRING,
});
Theme.belongsTo(Chapter, {
  as: "Chapter",
  foreignKey: "chapter",
  onDelete: "CASCADE",
});

module.exports = Theme;
