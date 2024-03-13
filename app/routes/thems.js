const Chapter = require("../models/Chapter");
const Lesson = require("../models/Lesson");
const Subject = require("../models/Subject");
const Theme = require("../models/Theme");
const Notification = require("../models/notification");

const route = require("express").Router();

route.post("/", async (req, res) => {
  try {
    const { name, chapter, video } = req.body;
    const chapterFind = await Chapter.findByPk(chapter);
    if (!chapterFind) {
      return res.status(400).json({
        message: "Not Found Tester",
      });
    } else {
      const response = await Theme.create({
        name: name,
        chapter: chapterFind?.id,
        video: video,
      });

      const lessons = await Lesson.findAll({
        where: {
          chapter: chapterFind?.id,
        },
        group: ["id", "user"],
      });
      const deletedLessons = await Lesson.destroy({
        where: {
          theme: null,
          chapter: chapterFind?.id,
        },
      });
      const themes = await Theme.findByPk(response?.id, {
        include: [
          {
            as: "Chapter",
            model: Chapter,
            required: true,
            attributes: ["id", "name"],
            include: [
              {
                as: "subjects",
                model: Subject,
                required: true,
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      // Barcha mavzularni yaratish shu foydalanuvchi uchun
      lessons.forEach(async (lesson) => {
        await Lesson.create({
          user: lesson?.user,
          theme: themes?.id,
          object: themes?.Chapter?.subjects?.id,
          chapter: themes?.Chapter?.id,
        });
        await Notification.create({
          user: lesson?.user,
          text: `${themes?.Chapter?.subjects?.name} faningizning ${themes?.Chapter?.name} bo'limiga  ${name} yangi  mavzu  qo'shildi !`,
        });
      });

      res.json({ code: 200, status: "OK", deletedLessons });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

route.get("/", async (req, res) => {
  let { limit, sort = "ASC", q, column, page = 1, chapter } = req.query;
  let conditions = {};
  if (chapter) {
    conditions.where = {
      chapter: chapter,
    };
  }
  if (q) {
    conditions.where = {
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
    const themes = await Theme.findAndCountAll({
      include: [
        {
          as: "Chapter",
          model: Chapter,
          required: true,
          attributes: ["id", "name"],
          include: [
            {
              as: "subjects",
              model: Subject,
              required: true,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      attributes: ["id", "name", "video"],
      ...conditions,
    });

    if (!themes.rows.length) {
      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "No themes found",
        total: 0,
        data: [],
      });
    }
    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Success Fetching Data",
      total: themes.count,
      data: themes.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
route.get("/:id", async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (theme) {
      res.json(theme);
    } else {
      res.status(404).json({ error: "theme not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.put("/:id", async (req, res) => {
  try {
    const theme = await Theme.findByPk(req.params.id);
    if (theme) {
      await Theme.update(req.body);
      res.json(theme);
    } else {
      res.status(404).json({ error: "theme not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Use count to check if the theme exists before attempting to delete
    const count = await Theme.count({
      where: { id: id },
    });

    if (count > 0) {
      // Destroy the theme that matches the given ID
      await Theme.destroy({
        where: { id: id },
      });
      res.status(204).json({ message: "Success delete Data" }); // No content to send back, but indicate success
    } else {
      res.status(404).json({ error: "Theme not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = route;
