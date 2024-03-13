const sequelize = require("sequelize");
const Chapter = require("../models/Chapter");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Subject = require("../models/Subject");
const Theme = require("../models/Theme");
const User = require("../models/User");

const route = require("express").Router();

route.get("/", async (req, res) => {
  let { user, theme } = req.query;
  let conditions = {};
  const userFind = await User.findByPk(user);
  const themeFind = await Theme.findByPk(theme);
  if (!themeFind) {
    return res.status(400).json({
      message: "Not Found theme",
    });
  } else {
    conditions.where = {
      ...conditions.where,
      theme: themeFind?.id,
    };
  }
  if (!userFind) {
    return res.status(400).json({
      message: "Not Found user",
    });
  } else {
    conditions.where = {
      ...conditions.where,
      user: userFind?.id,
    };
  }

  try {
    const response = await Lesson.findAndCountAll({
      include: [
        {
          as: "subjects",
          model: Subject,
          required: true,
          attributes: ["id", "name"],
        },
        {
          as: "themes",
          model: Theme,
          required: true,
          attributes: ["id", "name", "video"],
        },
      ],

      attributes: ["id", "result"],
      ...conditions,
    });

    if (!response.rows.length) {
      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "No response found",
        total: 0,
        data: [],
      });
    }
    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Success Fetching Data",
      total: response.count,
      data: response.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
route.get("/:id", async (req, res) => {
  try {
    const theme = await Lesson.findByPk(req.params.id, {
      include: [
        {
          as: "subjects",
          model: Subject,
          required: true,
          attributes: ["id", "name"],
        },
        {
          as: "chapters",
          model: Chapter,
          required: true,
          attributes: ["id", "name"],
        },
        {
          as: "themes",
          model: Theme,
          required: true,
          attributes: ["id", "name", "video"],
        },
      ],
    });
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
    const { theme, procent } = req.body;

    const themeFind = await Theme.findByPk(theme);
    if (!themeFind) {
      return res.status(404).json({ error: "Theme not found" });
    }
    const lessonsFind = await Lesson.findByPk(req.params.id);
    if (!lessonsFind) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    // Update the theme with the given name and ID

    const lesson = await Lesson.update(
      {
        result: true,
        procent: procent,
      },
      { where: { id: req.params.id } }
    );
    res.json({ code: 200, status: "OK", lesson });
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

route.get("/object/:id", async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { object: req.params.id, user: req.query.user },
      attributes: [
        [sequelize.literal('"lessons"."chapter"'), "lessonId"],
        "chapter",
      ],
      group: ['"chapters"."id"', "chapter"],
      include: [
        {
          model: Chapter,
          as: "chapters",
          required: true,
          attributes: ["id", "name"],
        },
      ],
    });

    const customRes = await Promise.all(
      lessons.map(async (lesson) => {
        const lessonStart = await Lesson.count({
          where: {
            object: req.params.id,
            chapter: lesson.chapter,
            user: req.query.user,
            result: false,
          },
        });
        const lessonFinish = await Lesson.count({
          where: {
            object: req.params.id,
            chapter: lesson.chapter,
            user: req.query.user,
            result: true,
          },
        });
        if (lessonFinish > 0) {
          if (lessonStart == 0)
            return {
              id: lesson.id,
              chapter: lesson.chapters,
              status: "finish",
            };
          else
            return {
              id: lesson.id,
              chapter: lesson.chapters,
              status: "complated",
            };
        } else
          return { id: lesson.id, chapter: lesson.chapters, status: "start" };
      })
    );
    const statusOrder = ["finish", "complated", "start"];

    const sortedData = customRes.sort((a, b) => {
      const statusA = statusOrder.indexOf(a.status);
      const statusB = statusOrder.indexOf(b.status);

      return statusA - statusB;
    });

    return res.status(200).json({
      code: 200,
      status: "OK",
      message: "No response found",
      total: 0,
      data: sortedData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
route.get("/chapter/:id", async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { chapter: req.params.id, user: req.query.user },
      include: [
        {
          as: "themes",
          model: Theme,
          required: true,
          attributes: ["id", "name"],
        },
      ],
    });
    const customLesson = lessons.map((lesson, item) => {
      if (item == 0 || lessons[item - 1]?.result == true)
        return {
          id: lesson.id,
          themes: lesson.themes,
          status: true,
          procent: lesson.procent,
        };
      else {
        return {
          id: lesson.id,
          themes: lesson.themes,
          status: false,
          procent: lesson.procent,
        };
      }
    });

    return res.status(200).json({
      code: 200,
      status: "OK",
      message: "No response found",
      total: 0,
      data: customLesson,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
route.put("/theme/:id", async (req, res) => {
  try {
    const { theme } = req.body;

    const themeFind = await Theme.findByPk(theme);
    if (!themeFind) {
      return res.status(404).json({ error: "Theme not found" });
    }
    const lessonsFind = await Lesson.findByPk(req.params.id);
    if (!lessonsFind) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    // Update the theme with the given name and ID

    const lesson = await Lesson.update(
      {
        result: true,
      },
      { where: { id: req.params.id } }
    );
    res.json({ code: 200, status: "OK", lesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = route;
