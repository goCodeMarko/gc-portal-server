"use_strict";

const path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  mongoose = require("mongoose"),
  padayon = require("../services/padayon"),
  { ObjectId } = require("mongodb");

User = mongoose.model(
  base,
  mongoose.Schema({
    email: { type: String, maxlength: 50, required: true },
    password: { type: String, maxlength: 50 },
    role: { type: String, maxlength: 20, default: "user" },
    firstname: { type: String, maxlength: 50, required: true },
    middlename: { type: String, maxlength: 50 },
    lastname: { type: String, maxlength: 50, required: true },
    qrcode: {
      publicId: { type: String, maxlength: 100, required: true },
      format: { type: String, maxlength: 25, required: true },
      url: { type: String, maxlength: 150, required: true },
    },
    isallowedtodelete: { type: Boolean, default: true },
    isallowedtocreate: { type: Boolean, default: true },
    isallowedtoupdate: { type: Boolean, default: true },
    isblock: { type: Boolean, default: false },
  })
);

module.exports.getUser = async (req, res, callback) => {
  try {
    const { userId } = req.fnParams;
    let response = {};
    const [result] = await User.aggregate([
      {
        $match: {
          _id: ObjectId(userId),
        },
      },
      {
        $project: {
          email: 1,
          role: 1,
          fullname: {
            $concat: ["$firstname", " ", "$lastname"],
          },
          isallowedtodelete: 1,
          isallowedtocreate: 1,
          isallowedtoupdate: 1,
          isblock: 1,
        },
      },
    ]);

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::getUser", error, req, res);
  }
}; //---------done

module.exports.getUsers = async (req, res, callback) => {
  try {
    let response = {};
    const result = await User.aggregate([
      {
        $match: {
          role: "user",
        },
      },
      {
        $project: {
          email: 1,
          role: 1,
          fullname: {
            $concat: ["$firstname", " ", "$lastname"],
          },
          isallowedtodelete: 1,
          isallowedtocreate: 1,
          isallowedtoupdate: 1,
          isblock: 1,
        },
      },
    ]);

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::getUsers", error, req, res);
  }
};

module.exports.authenticate = async (req, res, callback) => {
  try {
    let response = {};
    const email = req.body.email;
    const password = req.body.password;
    console.log(123324, email);
    console.log(123324, password);
    const account = await User.aggregate([
      {
        $match: {
          email: email,
          password: password,
        },
      },
      {
        $project: {
          email: 1,
          role: 1,
          fullname: {
            $concat: ["$firstname", " ", "$lastname"],
          },
          isblock: 1,
        },
      },
    ]);
    console.log(4565, account);
    response = account;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::authenticate", error, req, res);
  }
};

module.exports.updateUserAccess = async (req, res, callback) => {
  try {
    let response = {};
    const {
      userId,
      isallowedtodelete,
      isallowedtocreate,
      isallowedtoupdate,
      isblock,
    } = req.fnParams;
    const result = await User.updateOne(
      { _id: ObjectId(userId) },
      {
        $set: {
          isallowedtodelete,
          isallowedtocreate,
          isallowedtoupdate,
          isblock,
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::updateUserAccess", error, req, res);
  }
}; //---------done

module.exports.generateQR = async (req, res, callback) => {
  try {
    let response = {};
    const { secure_url, public_id, format, _id } = req.fnParams;

    const result = await User.updateOne(
      { _id: ObjectId(_id) },
      {
        $set: {
          qrcode: {
            publicId: public_id,
            url: secure_url,
            format: format,
          },
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::generateQR", error, req, res);
  }
}; //---------done

module.exports.verifyAccessControl = async (req, res, callback) => {
  try {
    let response = {};

    const { accessControls, _id } = req.fnParams;

    const result = await User.findOne({
      ...accessControls,
      _id: ObjectId(_id),
    });

    response = result;

    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::verifyAccessControl", error, req, res);
  }
}; //---------done
