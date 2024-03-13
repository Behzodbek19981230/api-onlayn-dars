const { Op } = require("sequelize");
const { errorResponse } = require("../../utils/response");
const Chapter = require("../models/Chapter");
const Subject = require("../models/Subject");
const Lesson = require("../models/Lesson");
const Notification = require("../models/notification");

class ChapterControlled {
  static async getAllChapter(req, res) {
    let { limit, sort = "ASC", q, column, page = 1, object } = req.query;
    let conditions = {};
    if (object) {
      conditions.where = {
        ...conditions.where,
        object: object,
      };
    }
    if (q) {
      conditions.where = {
        ...conditions.where,
        [Op.or]: [
          {
            name: {
              [Op.like]: "%" + q + "%",
            },
          },
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
      const chapters = await Chapter.findAndCountAll({
        include: [
          {
            as: "subjects",
            model: Subject,
            required: true,
            attributes: ["id", "name"],
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        ...conditions,
        order: [[column ?? "name", sort || "ASC"]],
      });
      console.log(chapters.rows);
      if (!chapters.rows.length > 0) {
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
        total: chapters.count,
        data: chapters.rows,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async addChapter(req, res) {
    try {
      const { name, object } = req.body;
      const objectFind = await Subject.findByPk(object);
      if (!objectFind) {
        return res.status(400).json({
          message: "Not Found Tester",
        });
      } else {
        const chapters = await Chapter.create({
          name: name,
          object: objectFind?.id,
        });
        const lessons = await Lesson.findAll({
          where: {
            object: objectFind?.id,
          },
          group: ["id", "user"],
        });
        if (lessons.length > 0) {
          lessons.forEach(async (lesson) => {
            await Lesson.create({
              user: lesson?.user,
              object: objectFind?.id,
              chapter: chapters?.id,
            });
            await Notification.create({
              user: lesson?.user,
              text: `${objectFind?.name} faningizga ${name} nomli bo'lim qo'shildi !`,
            });
          });
        }

        res.json({ code: 200, status: "OK", chapters });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const object = await Chapter.findByPk(req.params.id);

      if (!object) {
        return errorResponse(res, 404, "Not found", "Cannot find object");
      }
      const destroy = await Chapter.destroy({ where: { id: req.params.id } });

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

module.exports = ChapterControlled;
