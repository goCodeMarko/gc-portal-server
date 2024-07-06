"use_strict";

const { ObjectId } = require("mongodb");
const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  mongoose = require("mongoose");

PushSubscription = mongoose.model(
  base,
  mongoose.Schema(
    {
      endpoint: { type: string },
      expirationTime: { type: mongoose.Schema.Types.Mixed, default: null },
      keys: {
        p256dh: { type: string },
        auth: { type: string }
      }
    },
    { timestamps: true }
  )
);
module.exports.addSubscription = async (req, res, callback) => {
    try {
      let response = {};
      const body = req.fnParams;
  
      const newPushSubscription = new PushSubscription(body);
      const result = await newPushSubscription.save();
  
      response = result;
      callback(response);
    } catch (error) {
      padayon.ErrorHandler("Model::User::addUser", error, req, res);
    }
  }; 
  


