"use_strict";

const { ObjectId } = require("mongodb");
const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  moment = require("moment-timezone"),
  mongoose = require("mongoose");

  const BranchSchema = new mongoose.Schema(
    {
      name: { type: String },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  const DeviceSubscriptionSchema = new mongoose.Schema(
    {
      endpoint: { type: String },
      expirationTime: { type: mongoose.Schema.Types.Mixed, default: null },
      keys: {
        p256dh: { type: String },
        auth: { type: String }
      },
      company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
      branch: { type: mongoose.Schema.Types.ObjectId },
      role: { type: String },
      uid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
  );


  Company = mongoose.model(
    base,
    mongoose.Schema(
      {
        name: { type: String },
        branches: [BranchSchema],
        deviceSubscriptions: [DeviceSubscriptionSchema],
        isDeleted: { type: Boolean, default: false },
      },
      { timestamps: true }
    )
  );

module.exports.subscribe = async (req, res) => {
  try {
    let response = {};
    const body = req.fnParams; // Extract the request parameters

    const query = await Company.findByIdAndUpdate(
      { _id: ObjectId(body.company) }, 
      { $push: { deviceSubscriptions: body } }, 
      { new: true } // Return the modified document
    );

    console.log('---------------query', query)
    // const transaction = await Transaction.findOne({ _id: ObjectId(trans_id) });

    response = query;
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Model::Company::subscribe",
      error,
      req,
      res
    );
  }
}; 


