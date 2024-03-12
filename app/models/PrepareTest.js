const Sequelize = require("sequelize");
const Tester = require("./Tester");
const db = require("../../config/db");
const uuid = require("uuid/v4");
const PrepareTest = db.define("prepare_tests", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  num: Sequelize.INTEGER,
  tester: Sequelize.STRING,
  title: Sequelize.STRING,
  A: Sequelize.STRING,
  B: Sequelize.STRING,
  C: Sequelize.STRING,
  D: Sequelize.STRING,
  case: Sequelize.STRING,
  correctcase: Sequelize.STRING,
});

// PrepareTest.beforeCreate((food) => (food.id = uuid()));
// PrepareTest.belongsTo(Tester, { as: "Tester", foreignKey: "tester" });

module.exports = PrepareTest;
