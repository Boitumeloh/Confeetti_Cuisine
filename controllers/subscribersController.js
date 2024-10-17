"use strict";

const Subscriber = require("../models/subscriber");

const getSubscriberParams = (body) => ({
  name: body.name,
  email: body.email,
  zipCode: body.zipCode,
});

module.exports = {
  index: async (req, res, next) => {
    try {
      const subscribers = await Subscriber.find({});
      res.locals.subscribers = subscribers;
      next();
    } catch (error) {
      console.log(`Error fetching subscribers: ${error.message}`);
      next(error);
    }
  },

  indexView: (req, res) => {
    res.render("subscribers/index");
  },

  saveSubscriber: async (req, res) => {
    try {
      const newSubscriber = new Subscriber(getSubscriberParams(req.body));
      await newSubscriber.save();
      res.render("thanks");
    } catch (error) {
      console.log(`Error saving subscriber: ${error.message}`);
      res.send(error);
    }
  },

  new: (req, res) => {
    res.render("subscribers/new");
  },

  create: async (req, res, next) => {
    try {
      const subscriber = await Subscriber.create(getSubscriberParams(req.body));
      req.flash("success", `${subscriber.name}'s account created successfully!`);
      res.locals.redirect = "/subscribers";
      res.locals.subscriber = subscriber;
      next();
    } catch (error) {
      console.log(`Error saving subscriber: ${error.message}`);
      req.flash(
        "error",
        `Failed to create subscriber account because: ${error.message}.`
      );
      res.locals.redirect = "/subscribers/new";
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);
      res.locals.subscriber = subscriber;
      next();
    } catch (error) {
      console.log(`Error fetching subscriber by ID: ${error.message}`);
      next(error);
    }
  },

  showView: (req, res) => {
    res.render("subscribers/show");
  },

  edit: async (req, res, next) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);
      res.render("subscribers/edit", { subscriber });
    } catch (error) {
      console.log(`Error fetching subscriber by ID: ${error.message}`);
      next(error);
    }
  },

  update: async (req, res, next) => {
    const subscriberParams = getSubscriberParams(req.body);

    try {
      const subscriber = await Subscriber.findByIdAndUpdate(
        req.params.id,
        { $set: subscriberParams },
        { new: true }
      );
      res.locals.redirect = `/subscribers/${req.params.id}`;
      res.locals.subscriber = subscriber;
      next();
    } catch (error) {
      console.log(`Error updating subscriber by ID: ${error.message}`);
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await Subscriber.findByIdAndRemove(req.params.id);
      res.locals.redirect = "/subscribers";
      next();
    } catch (error) {
      console.log(`Error deleting subscriber by ID: ${error.message}`);
      next(error);
    }
  },

  redirectView: (req, res, next) => {
    const redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
};
