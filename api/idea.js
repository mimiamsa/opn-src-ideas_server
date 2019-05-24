const express = require("../node_modules/express")
const router = new express.Router();
const ideaModel = require("../models/idea")
const userModel = require("../models/user")

//API ENDPOINTS----------------------------------------------------------------------

// POST (create one idea): http://localhost:8888/api/idea
router.post("/", (req, res) => {
  ideaModel
    .create(req.body)
    .then(dbSuccess => {
      res.status(200).json({ txt: "successfully created idea", dbSuccess });
      userModel.findById(dbSuccess.creator)
        .then(user => {
          var userIdeas = user.myIdeas
          console.log("success on first call. user._id: ", user._id)
          userModel.findByIdAndUpdate(user._id, { myIdeas: [...userIdeas, dbSuccess._id]})
            .then(user => res.status(200).json({ user }))
            .catch(dbErr => {
              console.log("------------------failed on update ----------------")
              res.status(200).json(dbErr)
            })
        })
        .catch(dbErr => res.status(200).json(dbErr))
    })
    .catch(dbError => {
      res.status(500).json({ txt: "invalid server response", dbError });
    })
})

// GET (fetch all ideas): http://localhost:8888/api/idea
// router.get("/", (req,res) => {
//   const queryKey = Object.keys(req.query)[0];
//   const queryValue = Object.values(req.query)[0];

//   ideaModel
//   .find( {[queryKey] : queryValue})
//   .populate("creator")
//   .then(ideas => res.status(200).json({ideas}))
//   .catch(dbErr => res.status(200).json(dbErr))
// })

// GET route for filter/ sort
router.get("/", (req,res) => {
  // console.log("here's the req.query: ", req.query)
  var filter = {}
  req.query.tags ? filter = {'$match': {"tags": req.query.tags}} : filter = {'$match': {}}

  var addFields = {'$addFields': {'netvotes': {'$add': ['$upvotes', '$downvotes']}}}

  var sort = {}
  req.query.sort ? sort = {"$sort": { [req.query.sort]: -1 }} : sort = {"$sort": { "upvotes" : -1 }}

  ideaModel
  .aggregate([filter, addFields, sort, {
    '$lookup': {
      'from': 'users', 
      'localField': 'creator', 
      'foreignField': '_id', 
      'as': 'creator'
    }
  }, {
    '$unwind': {
      'path': '$creator'
    }}])
  .then(ideas => res.status(200).json({ideas}))
  .catch(dbErr => res.status(200).json(dbErr))
})

// GET (fetch one idea by id): http://localhost:8888/api/idea/1
router.get("/:id", (req, res) => {
  ideaModel
    .findById(req.params.id)
    .populate("creator")
    .populate({
      path: 'comments',
      populate: {
        path: 'creator',
        model: 'User'
      }
    })
    .then(idea => {
      res.status(200).json({ idea })
    })
    .catch(dbErr => res.status(200).json(dbErr))
})


//DELETE (fetch one idea by id & delete): http://localhost:8888/api/idea/1
router.delete("/:id", (req, res) => {
  ideaModel
    .findByIdAndDelete(req.params.id)
    .then(idea => {
      res.status(200).json({ idea })
      userModel.findById(idea.creator)
      .then( user => {
        var userIdeas = user.myIdeas; 
        console.log("userIdeas: ", userIdeas)

        userModel.findByIdAndUpdate(user._id, {myIdeas: userIdeas.pull(idea._id)})
        .then(user => {
          res.status(200).json({user});
          console.log("success; deleted idea from user: ", user)
        })
        .catch(dbErr => {
          res.status(200).json(dbErr);
          console.log("failed on findByIdAndUpdate")
        })
      })

    })
    .catch(dbErr => res.status(200).json(dbErr))
})

//UPDATE (fetch one idea by id & update): http://localhost:8888/api/idea/1
router.put("/:id", (req, res) => {
  ideaModel
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate("comments")
    .populate({
      path: 'comments',
      populate: {
        path: 'creator',
        model: 'User'
      }
    })
    .then(idea => res.status(200).json({ idea }))
    .catch(dbErr => res.status(200).json(dbErr))
})

router.put("/upvote/:id", (req,res) => {
  // console.log("req.body: ", req.body)

  ideaModel
  .findByIdAndUpdate(req.params.id, req.body)
  .then(idea => {
    res.status(200).json({idea})
    userModel.findById(req.body.loggedUser)
    .then( user => {
      var userUpvotes = user.upvotedIdeas; 

      console.log("userUpvotes: ", userUpvotes)
      userModel.findByIdAndUpdate(user._id, !userUpvotes.includes(idea._id) ? 
      {upvotedIdeas: [...userUpvotes, idea._id]}
      : {upvotedIdeas: userUpvotes.pull(idea._id)})
      .then(user => {
        res.status(200).json({user});
        console.log("success; updated user: ", user)
      })
      .catch(dbErr => {
        res.status(200).json(dbErr);
        console.log("failed on findByIdAndUpdate")
      })
    })
  })
  .catch(dbErr => res.status(200).json(dbErr))
})

//-----------------------------------------------------------------------------------

module.exports = router;