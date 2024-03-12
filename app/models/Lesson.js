const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");
const User = require("./User");
const Chapter = require("./Chapter");
const Theme = require("./Theme");

const Lesson = db.define("lessons", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This makes it auto-incrementing
  },
  result: { type: Sequelize.BOOLEAN, defaultValue: false },
  object: Sequelize.INTEGER,
  chapter: Sequelize.INTEGER,
  theme: Sequelize.INTEGER,
  user: Sequelize.INTEGER,
  status: { type: Sequelize.BOOLEAN, defaultValue: false },
  procent: Sequelize.INTEGER,
});
Lesson.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});
Lesson.belongsTo(User, {
  as: "Users",
  foreignKey: "user",
  onDelete: "CASCADE",
});
Lesson.belongsTo(Chapter, {
  as: "chapters",
  foreignKey: "chapter",
  onDelete: "CASCADE",
});
Lesson.belongsTo(Theme, {
  as: "themes",
  foreignKey: "theme",
  onDelete: "CASCADE",
});
module.exports = Lesson;
