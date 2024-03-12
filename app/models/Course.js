const Sequelize = require("sequelize");
const db = require("../../config/db");
const Subject = require("./Subject");
const User = require("./User");

const Course = db.define("courses", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Assuming that 'user' should be a foreign key referencing the 'id' in the 'User' model
  user: {
    type: Sequelize.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  // Assuming that 'object' should be a foreign key referencing the 'id' in the 'Subject' model
  object: {
    type: Sequelize.INTEGER,
    references: {
      model: Subject,
      key: "id",
    },
  },
});

Course.belongsTo(Subject, {
  as: "subjects",
  foreignKey: "object",
  onDelete: "CASCADE",
});

Course.belongsTo(User, {
  as: "Users",
  foreignKey: "user",
  onDelete: "CASCADE",
});

module.exports = Course;
