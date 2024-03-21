const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  _ = require("lodash"),
  { cashinDTO, cashoutDTO } = require("../services/dto"),
  model = require(`./../models/${base}`),
  cloudinary = require("./../services/cloudinary");

module.exports.addTransaction = async (req, res) => {
  try {
    let response = { success: true, code: 201 };

    let body = {
      type: req?.body?.type, // 0-cashin 1-cashout
      phone_number: req?.body?.phone_number,
      amount: req?.body?.amount,
      fee: req?.body?.fee,
      fee_payment_is_gcash: req?.body?.fee_payment_is_gcash,
      snapshot: req?.body?.snapshot,
      note: req?.body?.note,
    };

    if (_.isNil(body.type))
      throw new padayon.BadRequestException("Missing transaction type");

    if (body.type === 1) {
      //cashin
      const joi = {
        type: body.type,
        amount: body.amount,
        phone_number: body.phone_number,
        fee: body.fee,
        fee_payment_is_gcash: body.fee_payment_is_gcash,
        note: body.note,
      };
      await cashinDTO.validateAsync(joi);
      body = joi;
    } else if (body.type === 2) {
      //cashout
      const joi = {
        type: body.type,
        snapshot: body.snapshot,
        amount: body.amount,
        fee: body.fee,
        fee_payment_is_gcash:
          body.fee_payment_is_gcash?.toLowerCase() === "true",
        note: body.note,
      };
      console.log("joi", joi);
      await cashoutDTO.validateAsync(joi);
      body = joi;
    }

    // uploads the qr code image on the cloudinary
    let cloudinaryImg;
    if (!_.isEmpty(body.snapshot))
      cloudinaryImg = await cloudinary.uploader.upload(body.snapshot, {
        folder: "cashout",
      });
    req.fnParams = {
      ...body,
      snapshot: cloudinaryImg?.secure_url,
    };
    await model.addTransaction(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::addTransaction",
      error,
      req,
      res
    );
  }
}; //---------done

module.exports.getCashOuts = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    await model.getCashOuts(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::getCashOuts",
      error,
      req,
      res
    );
  }
};
