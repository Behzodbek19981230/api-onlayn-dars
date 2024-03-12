/** @format */

const { Op } = require("sequelize");
const PrepareTest = require("../models/PrepareTest");
const Test = require("../models/Test");
const Tester = require("../models/Tester");

const { httpResponse, errorResponse } = require("../../utils/response");

class PrepareTestController {
  static async getAllPrepareTest(req, res) {
    let { tester, limit, num, order = "ASC", page = 1 } = req.query;
    let conditions = {};

    if (tester) {
      conditions.where = {
        ...conditions.where,
        tester: {
          [Op.like]: "%" + tester + "%",
        },
      };
    }
    if (num) {
      conditions.where = {
        ...conditions.where,
        num: {
          [Op.like]: "%" + num + "%",
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
      const prepare_tests = await PrepareTest.findAndCountAll({
        include: [
          {
            as: "Tester",
            model: Tester,
            required: true,
            attributes: ["id", "first_name", "last_name"],
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        ...conditions,
      });

      if (!prepare_tests.rows.length > 0) {
        return errorResponse(res, 404, "Not found", "testers is empty");
      }

      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: prepare_tests.count,
        prepare_tests: prepare_tests.rows,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }

  static async generateTest(req, res) {
    try {
      const { tester_id, count_test, object } = req.body;
      const testerFind = await Tester.findByPk(tester_id);
      if (!testerFind) {
        return res.status(400).json({
          message: "Not Found Tester",
        });
      } else {
        let maxNum = -1; // Initialize with a very small value

        const tests = await Test.findAndCountAll({
          where: { object: object },
        });
        if (tests.count > 0) {
          const prepare_tests = await PrepareTest.findAndCountAll({
            where: { tester: tester_id },
          });

          prepare_tests.rows.forEach((row) => {
            if (row.num > maxNum) {
              maxNum = row.num;
            }
          });
          maxNum++;
          // Testni generatsiya qilish
          // sho'tta xatolik bor
          let arrtest = [];
          while (arrtest.length < tests.count) {
            var r = Math.floor(Math.random() * tests.count) + 1;
            if (arrtest.indexOf(r) === -1) arrtest.push(tests.rows[r - 1].id);
          }
          for (let i = 0; i < count_test; i++) {
            let testFind = await Test.findByPk(arrtest[i], {
              where: { object: object },
            });
            // if (!testFind) {
            //   testFind = await Test.findByPk(tests.rows[0].id, {
            //     where: { object: object },
            //   });
            // }
            console.log(testFind);

            // Test generatsiya qilish "javoblarini"
            var arr = [];
            let xx = [
              testFind.case1,
              testFind.case2,
              testFind.case3,
              testFind.case4,
            ];

            while (arr.length < 4) {
              var r = Math.floor(Math.random() * 4);
              if (arr.indexOf(r) === -1) arr.push(r);
            }
            await PrepareTest.create({
              tester: testerFind.id,
              num: maxNum,
              title: testFind.title,
              correctcase: xx[0],
              A: xx[arr[0]],
              B: xx[arr[1]],
              C: xx[arr[2]],
              D: xx[arr[3]],
            });
          }
        }

        const prepare_test_by_tester = await PrepareTest.findAndCountAll({
          include: [
            {
              as: "Tester",
              model: Tester,
              required: true,
              attributes: ["id", "first_name", "last_name"],
            },
          ],
          where: { num: maxNum, tester: tester_id },
        });
        res.status(200).json({
          code: 200,
          status: "OK",
          message: "Success Fetching Data",
          total: prepare_test_by_tester.count,
          prepare_test_by_tester: prepare_test_by_tester.rows,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
  static async getResult(req, res) {
    try {
      const { tester_id, results, num } = req.body;

      const prepare_tests = await PrepareTest.findAndCountAll({
        where: { tester: tester_id, num: num },
      });
      let misteks = [];
      let correctCount = 0;
      prepare_tests.rows.forEach((row) => {
        results?.forEach(async (test, i) => {
          if (row.id == test.id) {
            if (test.value == row.correctcase) {
              correctCount++;
            } else {
              misteks.push({ test: test, index: i + 1 });
            }
            await PrepareTest.update(
              {
                case: test.value,
              },
              { where: { id: row.id } }
            );
          }
        });
      });
      res.status(200).json({
        code: 200,
        status: "OK",
        message: "Success Fetching Data",
        total: correctCount,
        misteks: misteks,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
}

module.exports = PrepareTestController;
