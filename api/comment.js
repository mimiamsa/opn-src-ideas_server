const express = require("express")
const router = new express.Router();
const commentModel = require("../models/comment")


//API ENDPOINTS----------------------------------------------------------------------

// post comments
router.post("/", (req, res) => {
  commentModel
    .create(req.body)
    .then(dbSuccess => {
      res.status(200).json({ txt: "successfully created comments", dbSuccess });
    })
    .catch(dbError => {
      res.status(500).json({ txt: "invalid server response", dbError });
    })
})

// GET (fetch all comments ): http://localhost:8888/api/idea

router.get("/:id", (req, res) => {
  // console.log(req.params.id)
  commentModel
    .find({idea: req.params.id})
    .populate("creator")
    .then(dbSuccess => {
      // console.log(dbSuccess)
      res.status(200).json({ txt: "successfully created comments", dbSuccess });
    })
    .catch(dbError => {
      res.status(500).json({ txt: "invalid server response", dbError });
    })
})

//-----------------------------------------------------------------------------------

module.exports = router;