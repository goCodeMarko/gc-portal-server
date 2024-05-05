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
    "number.base": `Type should be a type of number`,
  }),
  snapshot: Joi.string().required().messages({
    "string.base": `Snapshot should be a type of string`,
    "satring.empty": `Snapshot cannot be an empty field`,
  }),
  amount: Joi.number().required().messages({
    "number.base": `Amount should be a type of number`,
    "number.empty": `Amount cannot be an empty field`,
  }),
  fee: Joi.number().required().messages({
    "number.base": `Fee should be a type of number`,
    "number.empty": `Fee cannot be an empty field`,
  }),
  fee_payment_is_gcash: Joi.boolean().required().messages({
    "number.base": `Fee payment type should be a type of boolean`,
    "number.empty": `Fee payment type cannot be an empty field`,
  }),
  note: Joi.allow("").optional().messages({
    "string.base": `Note should be a type of string`,
  }),
  trans_id: Joi.string().disallow(null).required().messages({
    "string.base": `Transaction id should be a type of string`,
    "string.empty": `Transaction id cannot be an empty`,
    "string.disallow": "Transaction id cannot be an empty",
  }),
});

module.exports.cashinDTO = Joi.object({
  type: Joi.number().min(1).max(2).required().messages({
    "number.base": `Type should be a type of number`,
  }),
  amount: Joi.number().required().messages({
    "number.base": `Amount should be a type of number`,
    "number.empty": `Amount cannot be an empty field`,
  }),
  phone_number: Joi.string()
    .regex(/^09\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": `Phone number format should be like this 09XXXXXXXXXX`,
      "string.empty": `Phone number cannot be an empty field`,
    }),
  fee: Joi.number().required().messages({
    "number.base": `Fee should be a type of number`,
    "number.empty": `Fee cannot be an empty field`,
  }),
  fee_payment_is_gcash: Joi.boolean().required().messages({
    "number.base": `Fee payment type should be a type of boolean`,
    "number.empty": `Fee payment type cannot be an empty field`,
  }),
  note: Joi.allow("").optional().messages({
    "string.base": `Note should be a type of string`,
  }),
  trans_id: Joi.string().disallow(null).required().messages({
    "string.base": `Transaction id should be a type of string`,
    "string.empty": `Transaction id cannot be an empty`,
    "string.disallow": "Transaction id cannot be an empty",
  }),
});

module.exports.updateTransactionStatusDTO = Joi.object({
  type: Joi.number().min(1).max(2).required().messages({
    "number.base": `Type should be a type of number`,
  }),
  status: Joi.number().disallow(null).required().messages({
    "number.base": `Status should be a type of number`,
    "number.empty": `Status cannot be an empty`,
    "number.disallow": "Status cannot be an empty",
  }),
  trans_id: Joi.string().disallow(null).required().messages({
    "string.base": `Transaction id should be a type of string`,
    "string.empty": `Transaction id cannot be an empty`,
    "string.disallow": "Transaction id cannot be an empty",
  }),
  cid: Joi.string().disallow(null).required().messages({
    "string.base": `Cash id should be a type of string`,
    "string.empty": `Cash id cannot be an empty`,
    "string.disallow": "Cash id cannot be an empty",
  }),
});

module.exports.approveCashinDTO = Joi.object({
  type: Joi.number().min(1).max(2).required().messages({
    "number.base": `Type should be a type of number`,
  }),
  status: Joi.number().disallow(null).required().messages({
    "number.base": `Status should be a type of number`,
    "number.empty": `Status cannot be an empty`,
    "number.disallow": "Status cannot be an empty",
  }),
  trans_id: Joi.string().disallow(null).required().messages({
    "string.base": `Transaction id should be a type of string`,
    "string.empty": `Transaction id cannot be an empty`,
    "string.disallow": "Transaction id cannot be an empty",
  }),
  cid: Joi.string().disallow(null).required().messages({
    "string.base": `Cash id should be a type of string`,
    "string.empty": `Cash id cannot be an empty`,
    "string.disallow": "Cash id cannot be an empty",
  }),
  screenshot: Joi.string().disallow(null).required().messages({
    "string.base": `Screenshot should be a type of string`,
    "string.empty": `Screenshot cannot be an empty`,
  }),
});

module.exports.createTransactionDTO = Joi.object({
  date: Joi.date().required().iso().messages({
    "date.base": `Date should be a type of iso`,
    "date.empty": `Date cannot be an empty`,
  }),
  gcash: Joi.number().disallow(null).required().messages({
    "number.base": `Gcash should be a type of number`,
    "number.empty": `Gcash cannot be an empty`,
    "number.disallow": "Gcash cannot be an empty",
  }),
  cash_on_hand: Joi.number().disallow(null).required().messages({
    "number.base": `Gcash should be a type of number`,
    "number.empty": `Gcash cannot be an empty`,
    "number.disallow": "Gcash cannot be an empty",
  }),
  gcashNumber: Joi.string()
    .regex(/^09\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": `Phone number format should be like this 09XXXXXXXXXX`,
      "string.empty": `Phone number cannot be an empty field`,
    }),
  cashout: Joi.array().items(Joi.string()).empty(),
  cashin: Joi.array().items(Joi.string()).empty(),
});


module.exports.userDTO = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `"email" should be a type of "email"`,
    "string.empty": `"email" cannot be an empty field`,
  }),
  password: Joi.string().required().messages({
    "number.base": `"password" should be a type of "string"`,
    "number.empty": `"password" cannot be an empty field`,
  })
});