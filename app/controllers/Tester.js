/** @format */

const { Op } = require("sequelize");
const Tester = require("../models/Tester");
const { httpResponse, errorResponse } = require("../../utils/response");

class TesterController {
  static async getAllTester(req, res) {
    let { first_name, last_name, limit, order = "ASC", page = 1 } = req.query;
    let conditions = {};

    if (first_name) {
      conditions.where = {
        ...conditions.where,
        first_name: {
          [Op.like]: "%" + first_name + "%",
        },
      };
    }
    if (last_name) {
      conditions.where = {
        ...conditions.where,
        last_name: {
          [Op.like]: "%" + last_name + "%",
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
      const testers = await Tester.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        ...conditions,
      });

      if (!testers.rows.length > 0) {
        return errorResponse(res, 404, "Not found", "testers is empty");
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: testers.count,
        testers: testers.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addTester(req, res) {
    try {
      const { first_name, last_name } = req.body;

      const tester = await Tester.create({
        first_name,
        last_name,
      });
      res.json({ code: 200, status: "OK", data: tester });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async editTester(req, res) {
    try {
      const testerFind = await Tester.findByPk(req.params.id);

      if (!testerFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const { first_name, last_name } = req.body;

      const tester = await Tester.update(
        {
          first_name,
          last_name,
        },
        { where: { id: req.params.id } }
      );
      res.json({ code: 200, status: "OK", test });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const tester = await Tester.findByPk(req.params.id);

      if (!tester) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const destroy = await Tester.destroy({ where: { id: req.params.id } });

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

module.exports = TesterController;
