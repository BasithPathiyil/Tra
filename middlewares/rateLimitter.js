const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skipSuccessfulRequests: true,
});

module.exports = {
  rateLimiter,
};
