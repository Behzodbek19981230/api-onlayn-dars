const { httpResponse, errorResponse } = require("../../utils/response");
const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");
class BannerController {
  static async getAll(req, res) {
    try {
      const response = await Banner.findAndCountAll({
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
      if (!req.file) {
        return res.status(400).send("No images were uploaded.");
      }
      if (!req.body.title) {
        return res.status(400).send("No title provided.");
      }

      const image = req.file;
      const imageBuffer = fs.readFileSync(image.path);

      const timestamp = Date.now(); // Use timestamp for unique filename

      // Specify the directory where the image will be saved
      const saveDirectory = "./public";
      // Ensure that the directory exists; if not, create it
      if (!fs.existsSync(saveDirectory)) {
        fs.mkdirSync(saveDirectory, { recursive: true });
      }

      // Construct the saveImagePath using the saveDirectory and the image filename
      const saveImagePath = path.join(
        saveDirectory,
        `_${timestamp}.${image.originalname.split(".").pop()}`
      );

      // Write the image buffer to the specified path
      fs.writeFileSync(saveImagePath, imageBuffer);

      // Construct the public URL for accessing the image
      const publicUrl = `${req.protocol}://${req.get(
        "host"
      )}/public/${path.basename(saveImagePath)}`;

      // Create the banner entry in the database with the title and image URL
      const banner = await Banner.create({
        title: req.body.title,
        image: publicUrl,
        link: req.body.link,
      });

      // Respond with the created banner data
      res.json({ code: 200, status: "OK", data: banner });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async edit(req, res) {
    try {
      const bannerFind = await Banner.findByPk(req.params.id);

      if (!bannerFind) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const image = req.file;
      const saveImagePath = `${req.title}.${image.filename}.${new Date()}`;
      console.log(saveImagePath);
      fs.writeFileSync(saveImagePath, image.buffer);
      const publicPath = "./public/";
      const publicImagePath = `${publicPath}${saveImagePath}`;
      fs.renameSync(saveImagePath, publicImagePath);
      const publicUrl = `${req.protocol}://${req.get(
        "host"
      )}/public/${saveImagePath}`;
      const data = {};
      if (req.title) {
        data.title = req.title;
      }
      if (publicUrl) {
        data.image = publicUrl;
      }
      const banner = await Banner.update(data, {
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
      const response = await Banner.findByPk(req.params.id);

      if (!response) {
        return errorResponse(res, 404, "Not found", "Cannot find food");
      }
      const destroy = await Banner.destroy({ where: { id: req.params.id } });

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

module.exports = BannerController;
