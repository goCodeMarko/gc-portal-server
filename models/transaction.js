"use_strict";

const { ObjectId } = require("mongodb");

const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  mongoose = require("mongoose");

Transaction = mongoose.model(
  base,
  mongoose.Schema(
    {
      type: { type: Number, required: true, lowercase: true }, // 1-cashin 2-cashout
      phone_number: { type: String },
      amount: { type: Number, default: 0 },
      fee: { type: Number, default: 0 },
      fee_payment_is_gcash: { type: Boolean, default: false },
      snapshot: { type: String, default: "" },
      status: { type: Number, required: true, lowercase: true, default: 1 }, // 1-pending 2-processing 3-completed 4-failed 5-cancelled
      note: { type: String, default: "" },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

module.exports.addTransaction = async (req, res, callback) => {
  try {
    let response = {};
    const body = req.fnParams;

    const transaction = new Transaction(body);
    const result = await transaction.save();

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::addTransaction", error, req, res);
  }
}; //---------done