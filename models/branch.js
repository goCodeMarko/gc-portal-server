"use_strict";

const { ObjectId } = require("mongodb");

const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  moment = require("moment-timezone"),
  mongoose = require("mongoose");

const CashSchema = new mongoose.Schema(
  {
    type: { type: Number, required: true, lowercase: true }, // 1-cashin 2-cashout
    phone_number: { type: String },
    amount: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    fee_payment_is_gcash: { type: Boolean, default: false },
    snapshot: { type: String, default: "" },
    status: { type: Number, required: true, lowercase: true, default: 1 }, // 1-pending, 2-approved 3-failed 4-cancelled
    note: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    date: { type: Date },
  },
  { timestamps: true }
);

Transaction = mongoose.model(
  base,
  mongoose.Schema(
    {
      date: { type: Date },
      gcash: { type: Number, default: 0 },
      cash_on_hand: { type: Number, default: 0 },
      gcashNumber: { type: String },
      report: { type: String, default: "" },
      cashout: [CashSchema],
      cashin: [CashSchema],
      createdBy: { type: mongoose.Schema.Types.ObjectId },
      frontliners: [{ _id: mongoose.Schema.Types.ObjectId }],
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

module.exports.findTransaction = async (req, res) => {
  try {
    let response = {};
    const { trans_id } = req.fnParams;

    const transaction = await Transaction.findOne({ _id: ObjectId(trans_id) });

    response = transaction;
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Model::Transaction::findTransaction",
      error,
      req,
      res
    );
  }
}; //---------done


