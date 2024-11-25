const Joi = require("joi");

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => ({ message: detail.message }));
    return res.status(400).json({ errors });
  }

  next();
};
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(4).required(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => ({ message: detail.message }));
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { validateRegistration, validateLogin };
