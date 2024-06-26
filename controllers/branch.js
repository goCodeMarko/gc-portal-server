const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  _ = require("lodash"),
  {
    cashinDTO,
    cashoutDTO,
    updateTransactionStatusDTO,
    approveCashinDTO,
    createTransactionDTO,
  } = require("../services/dto"),
  model = require(`./../models/${base}`),
  email = require("./../services/email"),
  moment = require("moment-timezone"),
  pdf = require("./../services/pdf"),
  cloudinary = require("./../services/cloudinary");

module.exports.createTransaction = async (req, res) => {
  try {
    let response = { success: true, code: 201 };

    let body = {
      gcash: req.body?.gcash,
      cash_on_hand: req.body?.cash_on_hand,
      gcashNumber: req.body?.gcashNumber,
      date: req.body?.date,
      cashout: [],
      cashin: [],
    };

    // Convert local time to UTC using the client's timezone
    const dateTime = moment
      .tz(body.date, "YYYY-MM-DDTHH:mm:ss", req.timezone)
      .utc();
    const dateUTC = dateTime.toISOString();
    body.date = dateUTC;

    const joi = {
      gcash: body.gcash,
      cash_on_hand: body.cash_on_hand,
      gcashNumber: body.gcashNumber,
      date: body.date,
      cashout: [],
      cashin: [],
    };

    await createTransactionDTO.validateAsync(joi);
    body = joi;

    req.fnParams = {
      ...body,
    };

    await model.createTransaction(req, res, async (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::createTransaction",
      error,
      req,
      res
    );
  }
}; //---------done

module.exports.getBranches = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    let body = {
      startDate: req.query?.startDate,
      endDate: req.query?.endDate,
    };

    req.fnParams = {
      ...body,
    };

    const result = await model.getBranches(req, res);

    response.data = result;
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::getBranches",
      error,
      req,
      res
    );
  }
};

