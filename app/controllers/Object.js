const { Op } = require("sequelize");
const Subject = require("../models/Subject");
const { httpResponse, errorResponse } = require("../../utils/response");

class ObjectControlled {
  static async getAllObject(req, res) {
    let { limit, sort = "ASC", q, column, page = 1 } = req.query;
    let conditions = {};

    if (q) {
      conditions.where = {
        ...conditions.where,
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + q + "%",
            },
          },
          // {
          //   age: {
          //     [Op.like]: "%" + q + "%",
          //   },
          // },
        ],
      };
    }

    if (limit) {
      limit = Number.parseInt(limit < 1 ? 1 : limit);
      page = Number.parseInt(page < 1 ? 1 : page);

      conditions.limit = limit;
      conditions.offset = (page - 1) * limit;
    }

    try {
      const objects = await Subject.findAndCountAll({
        attributes: {
          exclude: ["created_at", "updated_at"],
        },
        ...conditions,
        order: [[column ?? "name", sort || "ASC"]],
      });

      if (!objects.rows.length > 0) {
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
        total: objects.count,
        data: objects.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addObjects(req, res) {
    try {
      const { name } = req.body;

      const objects = await Subject.create({
        name,
      });
      res.json({ code: 200, status: "OK", objects });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async editObject(req, res) {
    try {
      const objectFind = await Subject.findByPk(req.params.id);

      if (!objectFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const { name } = req.body;

      const object = await Subject.update(
        {
          name,
        },
        { where: { id: req.params.id } }
      );
      res.json({ code: 200, status: "OK", object });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const object = await Subject.findByPk(req.params.id);

      if (!object) {
        return errorResponse(res, 404, "Not found", "Cannot find object");
      }
      const destroy = await Subject.destroy({ where: { id: req.params.id } });

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
}

module.exports = ObjectControlled;
