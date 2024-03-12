const Chapter = require("../models/Chapter");
const Subject = require("../models/Subject");
const Quiz = require("../models/Quiz");
const Theme = require("../models/Theme");

const route = require("express").Router();

route.post("/", async (req, res) => {
  try {
    const { title, case1, case2, case3, case4, object, chapter, theme } =
      req.body;
    const chapterFind = await Chapter.findByPk(chapter);
    const objectFind = await Subject.findByPk(object);
    const themeFind = await Theme.findByPk(theme);
    const response = await Quiz.create({
      title: title,
      case1: case1,
      case2: case2,
      case3: case3,
      case4: case4,
      object: objectFind?.id,
      theme: themeFind?.id,
      chapter: chapterFind?.id,
      createdBy: req.user?.id,
    });
    res.json({ code: 200, status: "OK", response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

route.get("/", async (req, res) => {
  let { object, chapter, theme } = req.query;
  let conditions = {};
  if (object) {
    conditions.where = {
      ...conditions.where,
      object: {
        [Op.eq]: object,
      },
    };
  }
  if (chapter) {
    conditions.where = {
      ...conditions.where,
      chapter: {
        [Op.eq]: chapter,
      },
    };
  }
  if (theme) {
    conditions.where = {
      ...conditions.where,
      theme: theme,
    };
  }

  try {
    const response = await Quiz.findAndCountAll({
      attributes: ["id", "title", "case1", "case2", "case3", "case4"],
      ...conditions,
    });

    if (!response.rows.length) {
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
      total: response.count,
      data: response.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
route.get("/statistics", async (req, res) => {
  const objects = await Subject.findAndCountAll();
  let { object, chapter, theme } = req.query;
  let conditions = {};
  if (object) {
    conditions.where = {
      ...conditions.where,
      object: {
        [Op.eq]: object,
      },
    };
  }
  if (chapter) {
    conditions.where = {
      ...conditions.where,
      chapter: {
        [Op.eq]: chapter,
      },
    };
  }
  if (theme) {
    conditions.where = {
      ...conditions.where,
      theme: {
        [Op.eq]: theme,
      },
    };
  }

  try {
    const quizRes = await Quiz.findAndCountAll();
    const response = objects.rows.map((obj) => {
      let totalQuiz = 0;
      quizRes.rows.forEach((quiz) => {
        if (quiz.object === obj.id) {
          totalQuiz += 1;
        }
      });
      return {
        id: obj.id,
        name: obj.name,
        totalQuiz: totalQuiz,
      };
    });
    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Success Fetching Data",
      total: response.length,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
route.put("/:id", async (req, res) => {
  const { id } = req.params; // Get the ID of the quiz to update
  const { title, case1, case2, case3, case4, object, chapter, theme } =
    req.body;

  try {
    // Find the related records just like in the POST method
    const chapterFind = await Chapter.findByPk(chapter);
    const objectFind = await Subject.findByPk(object);
    const themeFind = await Theme.findByPk(theme);

    // Update the quiz
    const [updated] = await Quiz.update(
      {
        title,
        case1,
        case2,
        case3,
        case4,
        object: objectFind?.id,
        theme: themeFind?.id,
        chapter: chapterFind?.id,
        // Assuming you might want to update who last modified the quiz
        // createdBy should be replaced or updated according to your requirements
        lastModifiedBy: req.user.id,
      },
      {
        where: { id: id },
      }
    );

    if (updated) {
      const updatedQuiz = await Quiz.findByPk(id);
      res.json({ code: 200, status: "OK", response: updatedQuiz });
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
route.delete("/:id", async (req, res) => {
  const { id } = req.params; // Get the ID of the quiz to delete

  try {
    const deleted = await Quiz.destroy({
      where: { id: id },
    });

    if (deleted) {
      res.status(204).send(); // Successfully deleted, no content to return
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = route;
