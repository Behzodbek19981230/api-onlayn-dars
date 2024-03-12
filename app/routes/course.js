const Chapter = require("../models/Chapter");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Subject = require("../models/Subject");
const Theme = require("../models/Theme");
const User = require("../models/User");
const Notification = require("../models/notification");

const route = require("express").Router();

route.post("/", async (req, res) => {
  try {
    const { user, object } = req.body;
    const userFind = await User.findByPk(user);
    if (!userFind) {
      return res.status(400).json({
        message: "Not Found user",
      });
    }
    const subjectFind = await Subject.findByPk(object);
    if (!subjectFind) {
      return res.status(400).json({
        message: "Not Found Subject",
      });
    }
    const courseFind = await Course.count({
      where: {
        user: userFind?.id,
        object: subjectFind?.id,
      },
    });
    if (!courseFind > 0) {
      const response = await Course.create({
        user: userFind?.id,
        object: subjectFind?.id,
      });
      await Notification.create({
        user: userFind?.id,
        text: `Tabriklaymiz ${subjectFind?.name} fani darslariga qo'shildingiz !`,
      });
      const themes = await Theme.findAll({
        include: [
          {
            as: "Chapter",
            model: Chapter,
            required: true,
            attributes: ["id", "name"],
            include: [
              {
                where: {
                  id: subjectFind?.id,
                },
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
      themes.forEach(async (theme, index) => {
        if (index === 0)
          await Lesson.create({
            status: true,
            user: userFind?.id,
            theme: theme?.id,
            object: theme?.Chapter?.subjects?.id,
            chapter: theme?.Chapter?.id,
          });
        else {
          await Lesson.create({
            user: userFind?.id,
            theme: theme?.id,
            object: theme?.Chapter?.subjects?.id,
            chapter: theme?.Chapter?.id,
          });
        }
      });
      res.json({ code: 200, status: "OK", response });
    } else
      res
        .status(400)
        .json({
          code: 400,
          status: "OK",
          message: "Bu kurs allaqachon mavjud!",
        });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

route.get("/", async (req, res) => {
  let { limit, sort = "ASC", q, column, page = 1, user } = req.query;
  let conditions = {};
  const userFind = await User.findByPk(user);
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
    const course = await Course.findAndCountAll({
      include: [
        {
          as: "subjects",
          model: Subject,
          required: true,
          attributes: ["id", "name"],
        },
      ],

      attributes: ["id"],
      ...conditions,
    });
    const customRes = await Promise.all(
      course.rows.map(async (item) => {
        const lessonFinish = await Lesson.findAll({
          where: {
            user: userFind?.id,
            object: item.subjects.id,
            result: true,
          },
        });
        const lessonNotFinish = await Lesson.findAll({
          where: {
            user: userFind?.id,
            object: item.subjects.id,
            result: false,
          },
        });
        return {
          id: item.id,
          subjects: item.subjects,
          totalLesson: lessonFinish.length + lessonNotFinish.length,
          finishLesson: lessonFinish.length,
          notFinishLesson: lessonNotFinish.length,
        };
      })
    );

    if (!course.rows.length) {
      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "No course found",
        total: 0,
        data: [],
      });
    }
    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Success Fetching Data",
      total: course.count,
      data: customRes,
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
