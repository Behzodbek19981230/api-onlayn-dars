const { httpResponse, errorResponse } = require("../../utils/response");
const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");
const LessonsLanding = require("../models/LessonsLanding");
class LessonsLandingController {
  static async getAll(req, res) {
    try {
      const response = await LessonsLanding.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (!response.rows.length > 0) {
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
        total: response.count,
        data: response.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async add(req, res) {
    try {
      const { name, text } = req.body;

      // Create the banner entry in the database with the title and image URL
      const response = await LessonsLanding.create({
        name: name,
        text: text,
      });

      // Respond with the created banner data
      res.json({ code: 200, status: "OK", data: response });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async edit(req, res) {
    try {
      const bannerFind = await LessonsLanding.findByPk(req.params.id);

      if (!bannerFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const data = {};
      if (req.body.name) {
        data.name = req.body.name;
      }
      if (req.body.text) {
        data.text = req.body.text;
      }

      const banner = await LessonsLanding.update(data, {
        where: { id: req.params.id },
      });
      res.json({ code: 200, status: "OK", data: banner });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const response = await LessonsLanding.findByPk(req.params.id);

      if (!response) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const destroy = await LessonsLanding.destroy({
        where: { id: req.params.id },
      });

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

module.exports = LessonsLandingController;
