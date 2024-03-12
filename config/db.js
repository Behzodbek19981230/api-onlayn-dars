const { Sequelize } = require("sequelize");

// const sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: "test.sqlite",
// });
const sequelize = new Sequelize(
  `postgres://postgres:123456@localhost:5433/discover`,
  { dialect: "postgres" }
);

module.exports = sequelize;
