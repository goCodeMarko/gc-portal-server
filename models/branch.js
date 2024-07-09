"use_strict";
const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  moment = require("moment-timezone"),
  mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema(
  {
    
    name: { type: String },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports.findTransaction = async (req, res) => {
  try {
    let response = {};
    const { trans_id } = req.fnParams;

    const transaction = await Transaction.findOne({ _id: new mongoose.Types.ObjectId(trans_id) });

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


