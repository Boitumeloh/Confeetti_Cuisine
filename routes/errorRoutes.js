"use strict";

const router = require("express").Router();
const errorController = require("../controllers/errorController");

router.use(errorController.pageNotFoundError);
router.use(errorController.internalServerError);

module.exports = router;
