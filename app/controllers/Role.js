/** @format */

const { Op } = require("sequelize");
const Role = require("../models/Role");
const { httpResponse, errorResponse } = require("../../utils/response");

class RoleControlled {
  static async getAllRole(req, res) {
    let { name, limit, order = "ASC", page = 1 } = req.query;
    let conditions = {};

    if (name) {
      conditions.where = {
        ...conditions.where,
        name: {
          [Op.like]: "%" + name + "%",
        },
      };
    }

    if (limit) {
      limit = Number.parseInt(limit < 1 ? 1 : limit);
      page = Number.parseInt(page < 1 ? 1 : page);

      conditions.limit = limit;
      conditions.offset = (page - 1) * limit;
    }

    try {
      const roles = await Role.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        ...conditions,
      });

      if (!roles.rows.length > 0) {
        return errorResponse(res, 404, "Not found", "roles is empty");
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: roles.count,
        data: roles.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addRoles(req, res) {
    try {
      const { name } = req.body;

      const roles = await Role.create({
        name,
      });
      res.json({ code: 200, status: "OK", roles });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async editRole(req, res) {
    try {
      const roleFind = await Role.findByPk(req.params.id);

      if (!roleFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const { name } = req.body;

      const role = await Role.update(
        {
          name,
        },
        { where: { id: req.params.id } }
      );
      res.json({ code: 200, status: "OK", role });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const role = await Role.findByPk(req.params.id);

      if (!role) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const destroy = await Role.destroy({ where: { id: req.params.id } });

      if (!destroy) {
        return errorResponse(res, 400, "Bad Request", "Cannot Delete");
      }

      res.json({
        code: 200,
        status: "OK",
        message: "Success delete food",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = RoleControlled;
