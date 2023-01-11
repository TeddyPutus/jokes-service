const express = require("express");
const app = express();
const { Joke } = require("./db");
const { Op } = require("sequelize");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/jokes/", async (req, res, next) => {
  try {
    if (Array.isArray(req.query.tags)) console.log(req.query.tags);
    const jokes = await Joke.findAll(
      req.query.tags
        ? Array.isArray(req.query.tags)
          ? {
              where: {
                tags: {
                  [Op.or]: req.query.tags.map((tag) => {
                    return { [Op.like]: "%" + tag + "%" };
                  }),
                },
                joke: req.query.content
                  ? { [Op.like]: "%" + req.query.content + "%" }
                  : { [Op.like]: "%" },
              },
            }
          : {
              where: {
                tags: { [Op.like]: "%" + req.query.tags + "%" },
                joke: req.query.content
                  ? { [Op.like]: "%" + req.query.content + "%" }
                  : { [Op.like]: "%" },
              },
            }
        : {
            where: {
              joke: req.query.content
                ? { [Op.like]: "%" + req.query.content + "%" }
                : { [Op.like]: "%" },
            },
          },
      {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      }
    );
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
