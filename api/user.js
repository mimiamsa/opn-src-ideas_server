const express = require("../node_modules/express")
const router = new express.Router();
const userModel = require("../models/user");
const fileUpload = require("./../config/cloudinaryconfig")

//API ENDPOINTS----------------------------------------------------------------------

// POST (create one user): http://localhost:8888/api/user
router.post("/", (req, res) => {
  userModel
    .create(req.body)
    .then(dbSuccess => {
      res.status(200).json({ txt: "successfully created user", dbSuccess });
    })
    .catch(dbError => {
      res.status(500).json({ txt: "invalid server response", dbError });
    })
})

router.patch("/add-avatar", fileUpload.single("avatarUpload"), (req, res, next) => {
  console.log("REQ", req)
  userModel
    .findByIdAndUpdate(req.body.id, {avatar : req.file.url})
      .then(dbSuccess => console.log("UPDATE SUCCESS:", dbSuccess))
      .catch(dbError => console.log(dbError))

  })

// GET (fetch all users): http://localhost:8888/api/user
router.get("/", (req, res) => {
  userModel
    .find()
    .populate("myIdeas")
    .then(users => res.status(200).json(users))
    .catch(dbErr => res.status(200).json(dbErr))
})

// GET (fetch one user by id): http://localhost:8888/api/user/1
router.get("/:id", (req, res) => {
  userModel
    .find(req.params.id)
    .populate("myIdeas")
    .then(users => res.status(200).json(users))
    .catch(dbErr => res.status(200).json(dbErr))
})

// GET (fetch one user by NAME): http://localhost:8888/api/user/name/1
router.get("/name/:name", (req, res) => {
  userModel
    .findOne({ name: req.params.name })
    .populate("myIdeas")
    .then(users => res.status(200).json(users))
    .catch(dbErr => res.status(200).json(dbErr))
})

//DELETE (fetch one user by id & delete): http://localhost:8888/api/user/1
router.delete("/:id", (req, res) => {
  userModel
    .findByIdAndDelete(req.params.id)
    .then(user => res.status(200).json({ user }))
    .catch(dbErr => res.status(200).json(dbErr))
})

//UPDATE (fetch one user by id & update): http://localhost:8888/api/user/1
router.put("/:id", (req, res) => {
  userModel
    .findByIdAndUpdate(req.params.id, req.body)
    .then(user => res.status(200).json({ user }))
    .catch(dbErr => res.status(200).json(dbErr))
})

//-----------------------------------------------------------------------------------

module.exports = router;
