const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: "test.sqlite",
// });
const sequelize = new Sequelize(
  `postgres://onlayndars:onlayndars@5.182.26.16:5432/host4577_`,
  { dialect: "postgres" }
);

module.exports = sequelize;
