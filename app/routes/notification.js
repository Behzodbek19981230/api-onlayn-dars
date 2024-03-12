const User = require("../models/User");
const Notification = require("../models/notification");

const route = require("express").Router();

route.get("/", async (req, res) => {
  let { limit, sort = "ASC", q, page = 1, user } = req.query;
  let conditions = {};
  if (user) {
    conditions.where = {
      user: user,
      read: false,
    };
  }

  if (limit) {
    limit = Number.parseInt(limit < 1 ? 1 : limit);
    page = Number.parseInt(page < 1 ? 1 : page);

    conditions.limit = limit;
    conditions.offset = (page - 1) * limit;
  }

  try {
    const notices = await Notification.findAndCountAll({
      include: [
        {
          as: "users",
          model: User,
          required: true,
        },
      ],
      ...conditions,
    });

    if (!notices.rows.length) {
      return res.status(200).json({
        code: 200,
        status: "OK",
        message: "No notices found",
        total: 0,
        data: [],
      });
    }
    res.status(200).json({
      code: 200,
      status: "OK",
      message: "Success Fetching Data",
      total: notices.count,
      data: notices.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
route.get("/:id", async (req, res) => {
  try {
    const notice = await Notification.findByPk(req.params.id);
    if (notice) {
      await Notification.update(
        {
          read: true,
        },
        { where: { id: req.params.id } }
      );
      res.json(notice);
    } else {
      res.status(404).json({ error: "notice not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Use count to check if the theme exists before attempting to delete
    const count = await Notification.count({
      where: { id: id },
    });

    if (count > 0) {
      // Destroy the theme that matches the given ID
      await Notification.destroy({
        where: { id: id },
      });
      res.status(204).json({ message: "Success delete Data" }); // No content to send back, but indicate success
    } else {
      res.status(404).json({ error: "Notification not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = route;
