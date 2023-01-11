const express = require("express");
const app = express();
const { Joke } = require("./db");
const { Op } = require("sequelize");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const {body, checkBody, param, validationResult} = require('express-validator');

app.get("/jokes/", async (req, res, next) => {
  try {
    const jokes = await Joke.findAll(
      {
        where: {
          tags: req.query.tags
            ? Array.isArray(req.query.tags)
              ? {
                  [Op.or]: req.query.tags.map((tag) => {
                    return { [Op.like]: "%" + tag + "%" };
                  }),
                }
              : {
                  [Op.or]: req.query.tags.split(",").map((tag) => {
                    return { [Op.like]: "%" + tag + "%" };
                  }),
                }
            : { [Op.like]: "%" },
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

app.post('/jokes',  
  //Validator function to check if any fields in body are empty
  [
      body('content').not().isEmpty().withMessage('content field is Empty'),
      body('tags').not().isEmpty().withMessage('tags field is Empty')
  ],
  async (req, res, next) => {
    
    //Handling errors if validation didnt pass 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors);  
    //If no errors, create new post
    } else{
        const newJoke = await Joke.create({
            joke : req.body.content,
            tags: req.body.tags
        })
        res.json(newJoke);
    }
  })

app.delete('/jokes/:id', 
  param('id').isNumeric().withMessage('Id is not Numeric'),
  async (req, res, next) => {
    try {
        const deletedJoke = await Joke.destroy({where: {id: req.params.id}});
        if(deletedJoke) res.json(deletedJoke); //200 - OK sent automatically
        else res.status(404).json(deletedJoke); //Return 0, and status 404 - not found
    } catch (error) {
        res.status(500).send(error); //Internal server error
    }

  })

app.put('/jokes/:id', 
  param('id').isNumeric().withMessage('Id is not Numeric'),
  async (req, res, next) => {
    //update, req body should contain both/either content, and tags
     //Handling errors if validation didnt pass
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
         return res.status(400).send(errors);
     }
 
     const joke = await Joke.findOne({where: {id: req.params.id}});
     
     // if joke exists in db
     if(joke){
         //check if body is empty - nothing to update!
         if(Object.keys(req.body).length === 0){
             res.status(400).send({ message: "Body is empty" })
 
         // if not update joke
         } else {
             await joke.update({
                 author: req.body.content ? req.body.content : joke.content, 
                 tags: req.body.tags ? req.body.tags : joke.tags
             })
             res.json(joke); //200 - OK sent automatically
         }
     } else {
         res.status(404).send({ message: "Joke does not exist" })
         }        

  })

// we export the app, not listening in here, so that we can run tests
module.exports = app;
