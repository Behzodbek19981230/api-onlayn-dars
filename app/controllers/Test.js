/** @format */

const { Op } = require("sequelize");
const Test = require("../models/Test");
const { httpResponse, errorResponse } = require("../../utils/response");
const XLSX = require("xlsx");
const User = require("../models/User");
const ExcelJS = require("exceljs");
const fs = require("fs");
const sharp = require("sharp");
class TestController {
  static async getAllTest(req, res) {
    let {
      limit,
      sort = "ASC",
      q,
      page = 1,
      column,
      createdBy,
      object,
    } = req.query;
    let conditions = {};
    if (q) {
      conditions.where = {
        ...conditions.where,
        [Op.or]: [
          {
            title: {
              [Op.like]: "%" + q + "%",
            },
          },
          {
            case1: {
              [Op.like]: "%" + q + "%",
            },
          },
          {
            case2: {
              [Op.like]: "%" + q + "%",
            },
          },
          {
            case3: {
              [Op.like]: "%" + q + "%",
            },
          },
          {
            case4: {
              [Op.like]: "%" + q + "%",
            },
          },
        ],
      };
    }
    console.log(createdBy);
    if (createdBy != "null") {
      conditions.where = {
        ...conditions.where,
        createdBy,
      };
    }
    if (object != "null") {
      conditions.where = {
        ...conditions.where,
        object,
      };
    }

    if (limit) {
      limit = Number.parseInt(limit < 1 ? 1 : limit);
      page = Number.parseInt(page < 1 ? 1 : page);

      conditions.limit = limit;
      conditions.offset = (page - 1) * limit;
    }

    try {
      const tests = await Test.findAndCountAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        ...conditions,
        order: [[column ?? "title", sort || "ASC"]],
      });

      if (!tests.rows.length > 0) {
        return res.status(200).json({
          code: 200,
          status: "OK",
          message: "Success Fetching Data",
          total: tests.count,
          data: [],
        });
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: tests.count,
        data: tests.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addTest(req, res) {
    try {
      const { title, case1, case2, case3, case4 } = req.body;

      const test = await Test.create({
        title,
        case1,
        case2,
        case3,
        case4,
      });
      res.json({ code: 200, status: "OK", test });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async editTest(req, res) {
    try {
      const testFind = await Test.findByPk(req.params.id);

      if (!testFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const { title, case1, case2, case3, case4 } = req.body;

      const test = await Test.update(
        {
          title,
          case1,
          case2,
          case3,
          case4,
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
      const test = await Test.findByPk(req.params.id);

      if (!test) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const destroy = await Test.destroy({ where: { id: req.params.id } });

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
  static async addTestFromExcel(req, res) {
    try {
      console.log(req.file);
      let path = req.file.path;
      const object = req.body.object;
      if (!object) {
        return res.status(400).json({
          success: false,
          message: "object not found",
        });
      }
      var workbook = XLSX.readFile(path);
      var sheet_name_list = workbook.SheetNames;
      let jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      if (jsonData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "xml sheet has no data",
        });
      } else {
        const workbook = new ExcelJS.Workbook();
        const data = await workbook.xlsx.readFile(path);
        const worksheet = workbook.worksheets[0];
        for (let i = 0; i < jsonData.length; i++) {
          const dataFile = {};

          for (const image of worksheet.getImages()) {
            const img = workbook.model.media.find(
              (m) => m.index === image.imageId
            );
            const saveImagePath = `${image.range.tl.nativeRow}.${image.range.tl.nativeCol}.${img.name}.${img.extension}`;
            console.log(saveImagePath);
            fs.writeFileSync(saveImagePath, img.buffer);
            const publicPath = "./public/";
            const publicImagePath = `${publicPath}${saveImagePath}`;
            fs.renameSync(saveImagePath, publicImagePath);
            const publicUrl = `${req.protocol}://${req.get(
              "host"
            )}/public/${saveImagePath}`;

            if (i + 1 == image.range.tl.nativeRow) {
              if (image.range.tl.nativeCol == 0) dataFile.Savol = publicUrl;
              if (image.range.tl.nativeCol == 1) dataFile.A = publicUrl;
              if (image.range.tl.nativeCol == 2) dataFile.B = publicUrl;
              if (image.range.tl.nativeCol == 3) dataFile.C = publicUrl;
              if (image.range.tl.nativeCol == 4) dataFile.D = publicUrl;
            }
          }
          const { Savol, A, B, C, D } = jsonData[i];

          await Test.create({
            title: Savol ?? dataFile.Savol,
            case1: A ?? dataFile.A,
            case2: B ?? dataFile.B,
            case3: C ?? dataFile.C,
            case4: D ?? dataFile.D,
            object: object,
            createdBy: req.user.id,
          });
        }
        res.json({ code: 200, status: "OK" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addTestSimple(req, res) {
    try {
      let path = req.file.path;
      const object = req.body.object;
      if (!object) {
        return res.status(400).json({
          success: false,
          message: "object not found",
        });
      }
      const workbook = new ExcelJS.Workbook();
      const data = await workbook.xlsx.readFile(path);
      const worksheet = workbook.worksheets[0];
      for (const image of worksheet.getImages()) {
        console.log(
          "processing image row",
          image.range.tl.nativeRow,
          "col",
          image.range.tl.nativeCol,
          "imageId",
          image.imageId
        );
        const img = workbook.model.media.find((m) => m.index === image.imageId);
        const saveImagePath = `${image.range.tl.nativeRow}.${image.range.tl.nativeCol}.${img.name}.${img.extension}`;

        fs.writeFileSync(saveImagePath, img.buffer);
        const publicPath = "./public/";
        const publicImagePath = `${publicPath}${saveImagePath}`;

        fs.renameSync(saveImagePath, publicImagePath);
        const publicUrl = `${req.protocol}://${req.get(
          "host"
        )}/public/${saveImagePath}`;

        console.log("path", publicUrl);
      }
      res.json({ code: 200, status: "OK" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = TestController;
