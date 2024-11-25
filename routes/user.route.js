const express = require("express");
const { userValidations } = require("../validations");
const { userController } = require("../controllers");

const router = express.Router();

router.post(
  "/register",
  userValidations.validateRegistration,
  userController.register
);
router.post("/login", userValidations.validateLogin, userController.login);

module.exports = router;
