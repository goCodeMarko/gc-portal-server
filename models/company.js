"use_strict";
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

module.exports.getSubsciber = async (req, res) => {
    try {
      let response = {};
      const body = req.fnParams; // Extract the request parameters
      console.log('-------------body', body)
      const query = await Company.findOne({
        _id: new mongoose.Types.ObjectId(body.company),
        deviceSubscriptions: {
          $elemMatch: { 
            endpoint: body.endpoint,
            uid: new mongoose.Types.ObjectId(body.uid)
          },
        },
      });
  
      response = query;
      console.log('--------------response', response)
      return response;
    } catch (error) {
      padayon.ErrorHandler(
        "Model::Company::getSubsciber",
        error,
        req,
        res
      );
    }
}; 

module.exports.subscribe = async (req, res) => {
  try {
    let response = {};
    const body = req.fnParams; // Extract the request parameters

    const query = await Company.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(body.company) }, 
      { $push: { deviceSubscriptions: body } }, 
      { new: true } // Return the modified document
    );

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


module.exports.notify = async (req, res) => {
  try {
    const company = req.query.company;
    const branch = req.query.branch;
    const uid = req.query.uid;
    const role = req.query.role;

    const MQLBuilder = [];

    if (company) {
      MQLBuilder.push( {
        '$match': {
          '_id': new mongoose.Types.ObjectId(company)
        }
      });
    }
    MQLBuilder.push( {
      '$unwind': {
        'path': '$deviceSubscriptions'
      }
    });
    if (uid) {
      MQLBuilder.push( {
        '$match': {
          'deviceSubscriptions.uid': new mongoose.Types.ObjectId(uid)
        }
      });
    }
    if (branch) {
      MQLBuilder.push( {
        '$match': {
          'deviceSubscriptions.branch': new mongoose.Types.ObjectId(branch)
        }
      });
    }
    if (role) {
      MQLBuilder.push( {
        '$match': {
          'deviceSubscriptions.role': role
        }
      });
    }

    const deviceSubscriptions = await Company.aggregate(MQLBuilder);
    return deviceSubscriptions;
  } catch (error) {
    padayon.ErrorHandler("Model::Company::notify", error, req, res);
  }
};


