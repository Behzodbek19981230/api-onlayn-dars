const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "test.sqlite",
});
// const sequelize = new Sequelize(
//   `postgres://onlayndars:onlayndars@localhost:5433/host4577_`,
//   { dialect: "postgres" }
// );

module.exports = sequelize;
