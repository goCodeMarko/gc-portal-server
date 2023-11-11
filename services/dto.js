const Joi = require("joi");

module.exports.bookDTO = Joi.object({
  title: Joi.string().required().messages({
    "string.base": `"title" should be a type of "string"`,
    "string.empty": `"title" cannot be an empty field`,
  }),
  author: Joi.string().required().messages({
    "string.base": `"author" should be a type of "string"`,
    "string.empty": `"author" cannot be an empty field`,
  }),
  price: Joi.number().required().messages({
    "number.base": `"price" should be a type of "number"`,
    "number.empty": `"price" cannot be an empty field`,
  }),
  stocks: Joi.number().integer().required().messages({
    "number.base": `"stocks" should be a type of "number"`,
    "number.empty": `"stocks" cannot be an empty field`,
  }),
});

module.exports.userAccessDTO = Joi.object({
  isallowedtodelete: Joi.boolean().required().messages({
    "boolean.base": `"isallowedtodelete" should be a type of "boolean"`,
    "boolean.empty": `"isallowedtodelete" cannot be an empty field`,
  }),
  isallowedtocreate: Joi.boolean().required().messages({
    "boolean.base": `"isallowedtocreate" should be a type of "boolean"`,
    "boolean.empty": `"isallowedtocreate" cannot be an empty field`,
  }),
  isallowedtoupdate: Joi.boolean().required().messages({
    "boolean.base": `"isallowedtoupdate" should be a type of "boolean"`,
    "boolean.empty": `"isallowedtoupdate" cannot be an empty field`,
  }),
  isblock: Joi.boolean().required().messages({
    "boolean.base": `"isblock" should be a type of "boolean"`,
    "boolean.empty": `"isblock" cannot be an empty field`,
  }),
});
