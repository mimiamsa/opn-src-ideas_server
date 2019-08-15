require("dotenv").config();
require("./config/mongoconfig");
require('./config/passport');

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const session = require('express-session');
const passport = require('passport');

//API ROUTERS------------------------------------------------------------------------
const apiUser = require("./api/user"); //Importing api's subrouters
const apiIdea = require("./api/idea"); //Importing api's subrouters
const apiComment = require("./api/comment"); //Importing api's subrouters

//BASIC SERVER CONFIG----------------------------------------------------------------

app.use(bodyParser.json())
app.use(cors({
  credentials: true,
  origin: process.env.REACT_DOMAIN
}));

// AUTHENTICATION
app.use(session({
  secret:"passport secret",
  saveUninitialized: false,
  resave: true,
  cookie: { secure: false, maxAge : (4 * 60 * 60 * 1000) }, // 4 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// const authRoutes = require('./api/auth-routes');
// app.use('/api', authRoutes);

//ROUTES PREFIXING-------------------------------------------------------------------
app.use("/api/user", apiUser) //Associating sub routers
app.use("/api/idea", apiIdea) //Associating sub routers
app.use("/api/comment", apiComment) //Associating sub routers

app.get("/", (req,res) => {
  res.send("Hello Open Source Ideas!")
})
//LISTENER---------------------------------------------------------------------------
const listener = app.listen(process.env.PORT, () => {
  console.log(`your app started at http://localhost:${listener.address().port}`)
})
