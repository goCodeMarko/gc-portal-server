"use_strict";

const path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  mongoose = require("mongoose"),
  padayon = require("../services/padayon"),
  bcrypt = require("bcrypt"),
  _ = require('lodash'),
  { ObjectId } = require("mongodb");

User = mongoose.model(
  base,
  mongoose.Schema({
    email: { type: String, maxlength: 50, required: true },
    password: { type: String, maxlength: 100, required: true },
    role: { type: String, maxlength: 20, default: "user" },
    firstname: { type: String, maxlength: 50 },
    middlename: { type: String, maxlength: 50 },
    lastname: { type: String, maxlength: 50 },
    qrcode: {
      publicId: { type: String, maxlength: 100 },
      format: { type: String, maxlength: 25 },
      url: { type: String, maxlength: 150 },
      text_output: { type: String, maxlength: 150 },
    },
    barcode: {
      publicId: { type: String, maxlength: 100 },
      format: { type: String, maxlength: 25 },
      url: { type: String, maxlength: 150 },
      text_output: { type: String, maxlength: 150 },
    },
    id_card: {
      front: {
        publicId: { type: String, maxlength: 100 },
        format: { type: String, maxlength: 25 },
        url: { type: String, maxlength: 150 },
      },
      back: {
        publicId: { type: String, maxlength: 100 },
        format: { type: String, maxlength: 25 },
        url: { type: String, maxlength: 150 },
      },
    },
    profile_picture: {
      publicId: { type: String, maxlength: 100 },
      format: { type: String, maxlength: 25 },
      url: { type: String, maxlength: 150 },
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
          firstname: 1,
          lastname: 1,
          isallowedtodelete: 1,
          isallowedtocreate: 1,
          isallowedtoupdate: 1,
          isblock: 1,
          id_card: 1,
          barcode: 1,
          qrcode: 1,
          profile_picture: 1,
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

    let account = await User.aggregate([
      {
        $match: {
          email: email
        },
      },
      {
        $project: {
          email: 1,
          role: 1,
          fullname: {
            $concat: ["$firstname", " ", "$lastname"],
          },
          password: 1,
          profile_picture: 1,
          isblock: 1,
        },
      },
    ]);

    if(_.size(account)){
      const bcryptResult = await bcrypt.compare(password, account[0].password);

      if(!bcryptResult) account = null;
      else delete account[0].password;
      
    }
    
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

module.exports.generateIdCard = async (req, res, callback) => {
  try {
    let response = {};
    const { front_card, back_card, _id } = req.fnParams;

    const result = await User.updateOne(
      { _id: ObjectId(_id) },
      {
        $set: {
          id_card: {
            front: {
              url: front_card?.secure_url,
              publicId: front_card?.public_id,
              format: front_card?.format,
            },
            back: {
              url: back_card?.secure_url,
              publicId: back_card?.public_id,
              format: back_card?.format,
            },
          },
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::generateIdCard", error, req, res);
  }
}; //---------done

module.exports.generateBarcode = async (req, res, callback) => {
  try {
    let response = {};
    const { secure_url, public_id, format, _id, text_output } = req.fnParams;

    const result = await User.updateOne(
      { _id: ObjectId(_id) },
      {
        $set: {
          barcode: {
            publicId: public_id,
            url: secure_url,
            format: format,
            text_output: text_output,
          },
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::generateBarcode", error, req, res);
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

module.exports.addUser = async (req, res, callback) => {
  try {
    let response = {};
    const body = req.fnParams;

    const newUser = new User(body);
    const result = await newUser.save();

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::User::addUser", error, req, res);
  }
}; //---------done
