const AppError = require("./AppError");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    const { statusCode, message } = err;
    return res.status(statusCode).json({
      status: false,
      statusCode: statusCode,
      error: { message: err.message, stack: err.stack },
    });
  }
  if (err instanceof ReferenceError || err instanceof TypeError) {
    return res.status(400).json({
      status: false,
      statusCode: 400,
      error: { message: err.message, stack: err.stack },
    });
  }
  // For internal errors
  res.status(500).json({
    status: false,
    statusCode: 500,
    error: { message: "Internal Server Error" },
  });
};

module.exports = {
  errorHandler,
};
