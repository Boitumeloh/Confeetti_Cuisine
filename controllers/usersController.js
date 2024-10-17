"use strict";

const User = require("../models/user");
const passport = require("passport");

const getUserParams = (body) => ({
  name: {
    first: body.first,
    last: body.last,
  },
  email: body.email,
  password: body.password,
  zipCode: body.zipCode,
});

module.exports = {
  index: async (req, res, next) => {
    try {
      const users = await User.find();
      res.locals.users = users;
      next();
    } catch (error) {
      console.log(`Error fetching users: ${error.message}`);
      next(error);
    }
  },

  indexView: (req, res) => {
    res.render("users/index");
  },

  new: (req, res) => {
    res.render("users/new");
  },

  create: async (req, res, next) => {
    if (req.skip) return next();
    const newUser = new User(getUserParams(req.body));

    try {
      const user = await User.register(newUser, req.body.password);
      req.flash("success", `${user.fullName}'s account created successfully!`);
      res.locals.redirect = "/users";
      next();
    } catch (error) {
      req.flash("error", `Failed to create user account: ${error.message}`);
      res.locals.redirect = "/users/new";
      next(error);
    }
  },

  redirectView: (req, res, next) => {
    const redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.locals.user = user;
      next();
    } catch (error) {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    }
  },

  showView: (req, res) => {
    res.render("users/show");
  },

  edit: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      res.render("users/edit", { user });
    } catch (error) {
      console.log(`Error fetching user by ID: ${error.message}`);
      next(error);
    }
  },

  update: async (req, res, next) => {
    const userParams = getUserParams(req.body);

    try {
      const user = await User.findByIdAndUpdate(req.params.id, { $set: userParams }, { new: true });
      res.locals.redirect = `/users/${req.params.id}`;
      res.locals.user = user;
      next();
    } catch (error) {
      console.log(`Error updating user by ID: ${error.message}`);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await User.findByIdAndRemove(req.params.id);
      res.locals.redirect = "/users";
      next();
    } catch (error) {
      console.log(`Error deleting user by ID: ${error.message}`);
      next(error);
    }
  },

  login: (req, res) => {
    res.render("users/login");
  },

  validate: async (req, res, next) => {
    req.sanitizeBody("email").normalizeEmail({ all_lowercase: true }).trim();
    req.check("email", "Email is invalid").isEmail();
    req.check("zipCode", "Zip code is invalid").notEmpty().isInt().isLength({ min: 5, max: 5 }).equals(req.body.zipCode);
    req.check("password", "Password cannot be empty").notEmpty();

    try {
      const result = await req.getValidationResult();
      if (!result.isEmpty()) {
        const messages = result.array().map(e => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/users/new";
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  authenticate: passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Failed to login.",
    successRedirect: "/",
    successFlash: "Logged in!",
  }),

  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.flash("success", "You have been logged out!");
      res.locals.redirect = "/";
      next();
    });
  },
};
