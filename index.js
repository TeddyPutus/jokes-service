const express = require('express');
const app = express();
const { Joke } = require('./db');
const { Op } = require("sequelize");
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/jokes/', async (req, res, next) => {
  try {
    // TODO - filter the jokes by tags and content
    // {where:{"tags": {[Op.like]: '%' + req.query.tags ? req.query.tags : "" + '%'}}, {"content": {[Op.like]: '%' + req.query.content ? req.query.content : "" + '%'}}}
    const jokes = await Joke.findAll(req.query.tags? Array.isArray(req.query.tags)? {where:{"tags":{ in: {[Op.like]: '%' + req.query.tags + '%'}}}} : {where:{"tags": {[Op.like]: '%' + req.query.tags + '%'}}} : {}, {attributes: {
      exclude: ['createdAt', 'updatedAt']
  }});
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
