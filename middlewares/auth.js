const User = require("../models/user.model");
const { tryCatch } = require("../utils/tryCatch");
const AppError = require("./AppError");
const jwt = require("jsonwebtoken");

const auth = tryCatch(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
    // Set token from cookie
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError(401, "Not authorized to access this route"));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  next();
});

module.exports = {
  auth,
};
