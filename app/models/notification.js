// Chapter.js
const Sequelize = require("sequelize");
const db = require("../../config/db");
const User = require("./User");

const Notification = db.define("notifications", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user: Sequelize.INTEGER,
  read: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  text: Sequelize.STRING,
});

Notification.belongsTo(User, {
  as: "users",
  foreignKey: "user",
  onDelete: "CASCADE",
});
module.exports = Notification;
