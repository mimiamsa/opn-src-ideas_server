const express = require("../node_modules/express")
const router = new express.Router();
const userModel = require("../models/user");
const fileUpload = require("./../config/cloudinaryconfig")
const passport = require("passport");
const bcrypt = require("bcryptjs");
//API ENDPOINTS----------------------------------------------------------------------

// POST (create one user): http://localhost:8888/api/user
router.post("/signup", (req, res) => {
  console.log(req.body)
  const { firstname, lastname, password, email } = req.body;
  var errorMsg = null;
  if (!firstname || !lastname || !password || !email)
    errorMsg = {
      message: "Provide username and password",
      status: "warning",
      httpStatus: 403 // 403	Forbidden
    };
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);
  const newUser = {
    firstname,
    lastname,
    email,
    password: hashPass
  };

  if (errorMsg) return res.status(errorMsg.httpStatus).json(errorMsg);


  userModel
    .create(newUser)
    .then(newUserFromDB => {
      // passport in action below
      req.login(newUserFromDB, err => {
        console.log("passport login result", newUserFromDB);
        console.log("passport login error", err);
        if (err) {
          return res.status(500).json({
            message: "Something went wrong with automatic login after signup"
          });
        }
        res.status(200).json({loginStatus: true, user:req.user});
      });
    })
    .catch(apiErr => {
      console.log("---------------");
      console.log("error while signin : code => ", apiErr.code);
      console.log(apiErr);
      console.log("---------------");

      const error = {
        11000: "The email already exists in database"
      };
      // you may want to use more error code(s) for precise error handling ...

      const message = {
        text: `Something went wrong saving user to Database : ${
          error[apiErr.code]
          }`,
        status: "warning"
      };

      res.status(409).json({ message }); // 409	Conflict
      return;
    });
})

router.patch("/add-avatar", fileUpload.single("avatarUpload"), (req, res, next) => {
  console.log("REQ", req)
  userModel
    .findByIdAndUpdate(req.body.id, { avatar: req.file.url })
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
    .findOne({ name: req.params.firstname })
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

//LOGIN ROUTES 
router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, failureDetails) => {
    var errorMsg = null;
    if (err) {
      console.log("signin error details", failureDetails);
      errorMsg = {
        message: "Something went wrong authenticating user",
        status: "error",
        httpStatus: 520
      };
    }

    if (!user)
    errorMsg = {
      message: "sorry, we couldn't find that account",
      status: "warning",
      httpStatus: 403
    };

    if (errorMsg) return res.status(errorMsg.httpStatus).json(errorMsg);
    req.logIn(user, function (err) {
      if (err) {
        // console.log("passport login error", err);
        return res.json({ message: "Something went wrong logging in" });
      }
      // We are now logged in (notice here, only req._id is sent back to client)
      // You may find usefull to send some other infos
      // console.log("passport login ok", req.user.firstname);
      // console.log("authenticated", req.isAuthenticated());
      // dont send sensitive informations back to the client
      // let's choose the exposed user below
      const { _id: id, firstname, lastname, email } = req.user;
   
      //  next(
        res.status(200).json({
          loginStatus: true,
          user: {
            id,
            firstname,
            lastname,
            email
          }
        })
      // );
    });
  })(req, res, next);
});

router.post("/signout", (req, res, next) => {
  req.logout();
  res.json({ message: "Success" });
});

router.get("/loggedin", (req, res, next) => {
  console.log("ask is loggedin ???", req.isAuthenticated());
  if (req.isAuthenticated()) {
    const { _id: id, firstname, lastname, email } = req.user;
    return res.status(200).json({
      loginStatus: true,
      message: "authorized",
      user: {
        id,
        firstname,
        lastname,
        email
      }
    });
  }
  res.status(403).json({ loginStatus: false, message: "Unauthorized" });
});



//-----------------------------------------------------------------------------------

module.exports = router;
