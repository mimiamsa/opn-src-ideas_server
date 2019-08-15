const userModel = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((userIdFromSession, done) => {
  userModel.findById(userIdFromSession, (err, userDocument) => {
    if (err) {
      done(err);
      return;
    }
    done(null, userDocument);
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // change default username credential to email
    function (email, passwd, next) {
      
      userModel
        .findOne({ email: email })
        .then(user => {
          // console.log("USER FOUND IN DB ===>", user.firstname)
          if (!user)
            return next(null, false, { message: "Incorrect email" });
          if (!bcrypt.compareSync(passwd, user.password)) {
            // if provided password is not valid
            return next(null, false, {
              message: "Incorrect password"
            });
          }
          // console.log("should be cool", user);
         next(null, user); // it's all good my friend !
        })
        .catch(dbErr => {
          console.log("signin catch", dbErr);
          // console.log("ERROR CATCH ===>", dbErr);
          next(dbErr, null);
        }); // if the db query fail...
    }
  )
);


