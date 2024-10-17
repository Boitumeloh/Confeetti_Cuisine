"use strict";

const express = require("express");
const layouts = require("express-ejs-layouts");
const app = express();
//const router = express.Router();
const router = require("./routes/index");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

//for hashing and authentication
const passport = require("passport");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const User = require("./models/user.js");

const connectFlash = require("connect-flash");

const expressValidator = require("express-validator");


mongoose.connect("mongodb://0.0.0.0:27017/confetti_cuisine", {
  useNewUrlParser: true,
});
mongoose.set("useCreateIndex", true);

app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");

app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

app.use(layouts);
app.use(express.static("public"));
app.use(expressValidator());

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());

//configuring cookieParser with a secret key
app.use(cookieParser("secretCuisine123"));
app.use(
  expressSession({
    secret: "secretCuisine123",
    cookie: {
      maxAge: 4000000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(connectFlash());

//configuring express.js to use sessions
//configuring express.js to initialize and use passport
app.use(passport.initialize());
//instructing passport to use sessions
app.use(passport.session());
//setting up the default login strategy
passport.use(User.createStrategy());
//setting up passport to compact , encrypt and decrypt user data
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  //assign flash messgaes to a local variable
  res.locals.flashMessages = req.flash();
  next();
});

app.use("/", router);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
