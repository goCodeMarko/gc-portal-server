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

module.exports.getTransaction = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    let body = {
      startDate: req.query?.startDate,
      endDate: req.query?.endDate,
    };

    req.fnParams = {
      ...body,
    };

    const result = await model.getTransaction(req, res);

    response.data = result;
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::getTransaction",
      error,
      req,
      res
    );
  }
};

module.exports.addTransaction = async (req, res) => {
  try {
    let response = { success: true, code: 201 };
  
    let body = {
      type: req?.body?.type, // 0-cashin 1-cashout
      phone_number: req?.body?.phone_number,
      amount: req?.body?.amount,
      fee: req?.body?.fee,
      fee_payment_is_gcash:
        req?.body?.fee_payment_is_gcash?.toLowerCase() === "true",
      snapshot: req.file?.path,
      note: req?.body?.note?.trim(),
      trans_id: req.query?.trans_id,
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
        trans_id: body.trans_id
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
        fee_payment_is_gcash: body.fee_payment_is_gcash,
        note: body.note,
        trans_id: body.trans_id
      };

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
      date: req.body?.date,
      createdBy: req.auth._id,
      updatedBy: req.auth._id,
    };

    const result = await model.addTransaction(req, res);

    response.data = result;
      if (result && body.type == 2) {
        await email.notify("patrickmarckdulaca@gmail.com", "cashout_template", {
          header: `Cash out`,
          banner: "cashout_banner",
          amount: result.amount,
          fee: result.fee,
          note: result.note,
          snapshot: result.snapshot,
        });
      } else if (result && body.type == 1) {
        await email.notify("patrickmarckdulaca@gmail.com", "cashin_template", {
          header: `Cash In`,
          banner: "cashin_banner",
          phone_number: result.phone_number,
          amount: result.amount,
          fee: result.fee,
          note: result.note,
        });
      }

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

module.exports.updateCICO = async (req, res) => {
  try {
    let response = { success: true, code: 201 };

    let body = {
      type: req?.body?.type, // 0-cashin 1-cashout
      phone_number: req?.body?.phone_number,
      amount: req?.body?.amount,
      fee: req?.body?.fee,
      fee_payment_is_gcash:
        req?.body?.fee_payment_is_gcash?.toLowerCase() === "true",
      snapshot: req.body.snapshot,
      note: req?.body?.note?.trim(),
      trans_id: req.query?.trans_id,
      cid: req.query?.cid,
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
        trans_id: body.trans_id,
      };
      await cashinDTO.validateAsync(joi);
      body = {...body, ...joi};
    } else if (body.type === 2) {
      //cashout
      const joi = {
        type: body.type,
        snapshot: body.snapshot,
        amount: body.amount,
        fee: body.fee,
        fee_payment_is_gcash: body.fee_payment_is_gcash,
        note: body.note,
        trans_id: body.trans_id,
      };
    
      await cashoutDTO.validateAsync(joi);
    
      body = {...body, ...joi};
    } 
   
    // uploads the qr code image on the cloudinary
    let cloudinaryImg;

    req.fnParams = {
      ...body,
      date: req.body?.date,
    };

    if (_.isEmpty(body.snapshot) && body.type == 2){ //if empty meaning this is a new image and not yet uploaded to cloudinary
      cloudinaryImg = await cloudinary.uploader.upload(req.file.path, {
        folder: "cashout",
      });
      req.fnParams.snapshot = cloudinaryImg?.secure_url
    }else {
      req.fnParams.snapshot = body.snapshot
    }

    await model.updateCICO(req, res, async (result) => {
      response.data = result;
    });

    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::Transaction::updateCICO",
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
      cid: req.query?.cid,
      type: Number(req.body?.type),
    };

    if ([2, 3].includes(body.status) && req.auth?.role === "frontliner") {
      throw new padayon.BadRequestException("Restricted");
    }

    if (body.status === 2 && body.type === 1) {
      const joi = {
        status: body.status,
        cid: body.cid,
        trans_id: body.trans_id,
        screenshot: req.file?.path,
        type: body.type,
      };

      await approveCashinDTO.validateAsync(joi);

      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "cashin",
        type: "authenticated",
        resource_type: "auto",
        // allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
      });

      body = { ...joi, screenshot: upload.secure_url };
    } else {
      const joi = {
        status: body.status,
        cid: body.cid,
        trans_id: body.trans_id,
        type: body.type,
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

    const result = await model.getCashOuts(req, res);
    response.data = result;

    // if (_.size(result) === 0) {
    //   response.data = [];
    // }

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

    const result = await model.getCashIns(req, res);

    response.data = result;

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

module.exports.generateReport = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const transactionDetails = await this.getTransaction(req, res);
    const cashout =  transactionDetails.data.cashout.filter(c => c.status === 2).map(c => {
      return {...c, timezone: req.timezone}
    });
    const cashin =  transactionDetails.data.cashin.filter(c => c.status === 2).map(c => {
      return {...c, timezone: req.timezone}
    });
    transactionDetails.data.cashout = cashout;
    transactionDetails.data.cashin = cashin;

    // const filename = moment.utc(transactionDetails.data?.date).tz(req.timezone).format('MMM_DD_YYYY');

    // res.writeHead(200, {
    //   "Content-Type": "application/pdf", // Set the appropriate content type
    //   "Content-Disposition": `attachment; filename=${filename}.pdf`, // Change the filename as needed
    // });

    const pdfBuffer = await pdf.generate("report_transaction", {
      name: 'Patrick Marck Dulaca',
      thCO: ["Time", "Amount", "Fee"],
      tdCO: transactionDetails.data?.cashout,
      thCI: ["Time","Account", "Amount", "Fee"],
      tdCI: transactionDetails.data?.cashin,
      cashin_stats: transactionDetails.data?.cashin_stats,
      cashout_stats: transactionDetails.data?.cashout_stats,
      gcash: transactionDetails.data?.gcash,
      runbal_gcash: transactionDetails.data?.runbal_gcash,
      gcashNumber: transactionDetails.data?.gcashNumber,
      cash_on_hand: transactionDetails.data?.cash_on_hand,
      runbal_cash_on_hand: transactionDetails.data?.runbal_cash_on_hand
    });
    const transDate = moment.utc(transactionDetails.data?.date).tz(req.timezone).format('MMM DD, YYYY');
    await email.notify( req.auth?.email, "send_report_template", {
      header: `Gcash Daily Report`,
      banner: "daily_report_banner",
      name: req.auth?.fullname,
      date: transDate,
      attachments: [{
        filename: "gcash_report.pdf",
        content: pdfBuffer
      }]
    }); 

    // res.write(pdfBuffer);
    // res.end();
    // pdfBuffer.on("data", (chunk) => {
    //   res.write(chunk);
    // });

    // pdfBuffer.on("error", (err) => {
    //   throw new Error("Failed during PDF file download");
    // });

    // pdfBuffer.on("close", () => {
    //   res.end();
    // });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::Transaction::generateReport", error, req, res);
  }
}; 
