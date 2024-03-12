const Sequelize = require("sequelize");
const db = require("../../config/db");

const Role = db.define("roles", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This makes it auto-incrementing
  },
  name: Sequelize.STRING,
});

module.exports = Role;
