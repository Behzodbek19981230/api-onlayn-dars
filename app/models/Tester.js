const Sequelize = require("sequelize");
const db = require("../../config/db");

const Tester = db.define("testers", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true, // This makes it auto-incrementing
  },
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
});

module.exports = Tester;
