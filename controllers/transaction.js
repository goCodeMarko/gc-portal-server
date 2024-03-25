const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  _ = require("lodash"),
  {
    cashinDTO,
    cashoutDTO,
    updateTransactionStatusDTO,
    approveCashinDTO,
  } = require("../services/dto"),
  model = require(`./../models/${base}`),
  email = require("./../services/email"),
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
    await model.addTransaction(req, res, async (result) => {
      response.data = result;

      if (result && body.type === 2) {
        await email.notify("patrickmarckdulaca@gmail.com", "cashout_template", {
          header: `CASH OUT`,
          banner: "cashout_banner",
          amount: result.amount,
          fee: result.fee,
          note: result.note,
          snapshot: result.snapshot,
        });
      } else if (result && body.type === 1) {
        await email.notify("patrickmarckdulaca@gmail.com", "cashin_template", {
          header: `CASH IN`,
          banner: "cashin_banner",
          phone_number: result.phone_number,
          amount: result.amount,
          fee: result.fee,
          note: result.note,
        });
      }
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

module.exports.updateTransactionStatus = async (req, res) => {
  try {
    let response = { success: true, code: 201 };
    let body = {
      status: Number(req.body?.status),
      trans_id: req.query?.trans_id,
      type: Number(req.body.type),
    };

    if ([2, 3].includes(body.status) && req.auth?.role === "frontliner") {
      throw new padayon.BadRequestException("Restricted");
    }

    if (body.status === 2 && body.type === 1) {
      const joi = {
        status: body.status,
        trans_id: body.trans_id,
        screenshot: req.file?.path,
      };

      await approveCashinDTO.validateAsync(joi);

      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "profile_pictures",
        type: "authenticated",
        resource_type: "auto",
        // allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
      });

      body = { ...joi, screenshot: upload.secure_url };
    } else {
      const joi = {
        status: body.status,
        trans_id: body.trans_id,
      };

      await updateTransactionStatusDTO.validateAsync(joi);
      body = joi;
    }

    req.fnParams = {
      ...body,
    };

    const transaction = await model.findTransaction(req, res);

    if (!transaction) {
      throw new padayon.BadRequestException("No transaction found");
    }

    await model.updateTransactionStatus(req, res, async (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::updateTransactionStatus",
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

module.exports.getCashIns = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    await model.getCashIns(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::getCashIns",
      error,
      req,
      res
    );
  }
};
