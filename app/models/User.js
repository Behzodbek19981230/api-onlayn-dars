const Sequelize = require("sequelize");
const db = require("../../config/db");
const Role = require("./Role");
const User = db.define(
  "users",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true, // This makes it auto-incrementing
    },
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    fullName: Sequelize.STRING,
    avatar: Sequelize.STRING,
    role: Sequelize.INTEGER,
  },
  { underscored: true }
);

User.belongsTo(Role, { as: "Roles", foreignKey: "role", onDelete: "CASCADE" });

module.exports = User;
