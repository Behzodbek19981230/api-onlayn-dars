const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "test.sqlite",
});

module.exports = sequelize;
