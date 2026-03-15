const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('patient').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const recordSchema = Joi.object({
  bloodGroup: Joi.string().max(10).allow(''),
  medicalDetails: Joi.string().max(1000).required()
});

module.exports = { signupSchema, loginSchema, recordSchema };
