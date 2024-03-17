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

module.exports.cashoutDTO = Joi.object({
  type: Joi.number().min(1).max(2).required().messages({
    "number.base": `string should be a type of number`,
  }),
  snapshot: Joi.string().required().messages({
    "string.base": `"snapshot" should be a type of "string"`,
    "number.base": `"amount" should be a type of "number"`,
    "number.empty": `"amount" cannot be an empty field`,
  }),
  amount: Joi.number().required().messages({
    "number.base": `"amount" should be a type of "number"`,
    "number.empty": `"amount" cannot be an empty field`,
  }),
  fee: Joi.number().required().messages({
    "number.base": `"fee" should be a type of "number"`,
    "number.empty": `"fee" cannot be an empty field`,
  }),
  fee_payment_is_gcash: Joi.boolean().required().messages({
    "number.base": `"fee payment type" should be a type of "boolean"`,
    "number.empty": `"fee payment type" cannot be an empty field`,
  }),
  note: Joi.string().messages({
    "string.base": `"note" should be a type of "string"`,
  }),
});

module.exports.cashinDTO = Joi.object({
  type: Joi.number().min(1).max(2).required().messages({
    "number.base": `string should be a type of number`,
  }),
  amount: Joi.number().required().messages({
    "number.base": `"amount" should be a type of "number"`,
    "number.empty": `"amount" cannot be an empty field`,
  }),
  phone_number: Joi.string()
    .regex(/^09\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": `"phone number" format should be like this 09XXXXXXXXXX`,
      "string.empty": `"phone number" cannot be an empty field`,
    }),
  fee: Joi.number().required().messages({
    "number.base": `"fee" should be a type of "number"`,
    "number.empty": `"fee" cannot be an empty field`,
  }),
  fee_payment_is_gcash: Joi.boolean().required().messages({
    "number.base": `"fee payment type" should be a type of "boolean"`,
    "number.empty": `"fee payment type" cannot be an empty field`,
  }),
  note: Joi.string().messages({
    "string.base": `"note" should be a type of "string"`,
  }),
});
