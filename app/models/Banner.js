const Sequelize = require("sequelize");
const db = require("../../config/db");

const Banner = db.define("banners", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: Sequelize.STRING,
  image: Sequelize.STRING,
  link: Sequelize.STRING,
});

module.exports = Banner;
