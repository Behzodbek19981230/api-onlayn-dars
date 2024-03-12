/** @format */

const User = require("../models/User");
const { errorResponse } = require("../../utils/response");
const bcrypt = require("bcryptjs");
const validateUserLogin = require("../../utils/validators/user");
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const { Op } = require("sequelize");
require("dotenv").config();

class UserController {
  static async register(req, res) {
    try {
      const { errors, isValid } = validateUserLogin(req.body);
      if (!isValid) {
        return errorResponse(res, 400, "Bad Request", errors);
      }

      const currentUser = await User.findOne({
        where: {
          username: req.body.username,
        },
      });

      if (currentUser) {
        if (currentUser.username === req.body.username) {
          errors.username = "User already exist";
          return errorResponse(res, 400, "Bad Request", errors);
        }
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const data = {
        username: req.body.username,
        password: hashedPassword,
        fullName: req.body.fullName,
        role: req.body.role,
      };
      const newUser = await User.create(data);
      res.json({
        code: 200,
        status: "OK",
        message: "Success Register User",
        user: newUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async login(req, res) {
    try {
      const { errors, isValid } = validateUserLogin(req.body);
      if (!isValid) {
        return errorResponse(res, 400, "Bad Request", errors);
      }
      const user = await User.findOne({
        include: [
          {
            as: "Roles",
            model: Role,
            required: true,
            attributes: ["id", "name"],
          },
        ],
        where: {
          username: req.body.username,
        },
      });

      if (!user) {
        return errorResponse(res, 400, "Not Found", "User not registered");
      }

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!isValidPassword) {
        return errorResponse(res, 400, "Bad Request", {
          password: "Invalid Password",
        });
      }

      const parsedUser = JSON.parse(JSON.stringify(user));

      delete parsedUser.password;

      const token = jwt.sign(parsedUser, process.env.JWT_SECRET, {
        expiresIn: "23h",
      });

      res.json({
        code: 200,
        status: "OK",
        message: "Success Login",
        user: parsedUser,
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async profile(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            as: "Roles",
            model: Role,
            required: true,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          code: 404,
          status: "Not Found",
          message: "User not found",
        });
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        user: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async getAllUsers(req, res) {
    let { limit, role, sort = "ASC", q, page = 1 } = req.query;
    let conditions = {};

    if (q) {
      conditions.where = {
        ...conditions.where,
        [Op.or]: [
          {
            username: {
              [Op.like]: "%" + q + "%",
            },
          },
          {
            fullName: {
              [Op.like]: "%" + q + "%",
            },
          },
        ],
      };
    }
    if (!role == "") {
      conditions.where = {
        ...conditions.where,
        role,
      };
    }

    if (limit) {
      limit = Number.parseInt(limit < 1 ? 1 : limit);
      page = Number.parseInt(page < 1 ? 1 : page);

      conditions.limit = limit;
      conditions.offset = (page - 1) * limit;
    }

    try {
      const users = await User.findAndCountAll({
        include: [
          {
            as: "Roles",
            model: Role,
            required: true,
            attributes: ["id", "name"],
          },
        ],
        attributes: {
          exclude: ["role", "createdAt", "updatedAt"],
        },
        ...conditions,
        order: [["fullName", sort || "ASC"]],
      });

      if (!users.rows.length > 0) {
        return res.status(200).json({
          code: 200,
          status: "OK",
          message: "Success Fetching Data",
          total: 0,
          data: [],
        });
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: users.count,
        data: users.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async delete(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      console.log(user);
      if (!user) {
        return errorResponse(res, 404, "Not found", "Cannot find user");
      }
      const destroy = await User.destroy({ where: { id: req.params.id } });

      if (!destroy) {
        return errorResponse(res, 400, "Bad Request", "Cannot Delete");
      }

      res.json({
        code: 200,
        status: "OK",
        message: "Success delete object",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async getByIdUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          {
            as: "Roles",
            model: Role,
            required: true,
            attributes: ["id", "name"],
          },
        ],
      });

      if (!user) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }

      res.json({ code: 200, status: "OK", user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = UserController;
