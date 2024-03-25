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
      status: { type: Number, required: true, lowercase: true, default: 1 }, // 1-pending, 2-approved 3-failed 4-cancelled
      note: { type: String, default: "" },
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

module.exports.updateTransactionStatus = async (req, res, callback) => {
  try {
    let response = {};
    const { status, trans_id, screenshot } = req.fnParams;
    const result = await Transaction.updateOne(
      { _id: ObjectId(trans_id) },
      {
        $set: {
          status,
          snapshot: screenshot ? screenshot : "",
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler(
      "Model::User::updateTransactionStatus",
      error,
      req,
      res
    );
  }
}; //---------done

module.exports.getCashOuts = async (req, res, callback) => {
  try {
    const MQLBuilder = [
      { $match: { isDeleted: false, type: 2 } },
      { $sort: { createdAt: -1 } },
    ];
    const skip = req.query.skipCount ? Number(req.query.skipCount) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const searchText = req.query.searchText;
    const searchBy = req.query.searchBy;
    const sortBy = req.query.sortBy ?? "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    if (searchText) {
      MQLBuilder[0]["$match"][searchBy] = {
        $regex: searchText,
        $options: "i",
      };
    }

    if (sortBy !== "createdAt") {
      MQLBuilder.push({ $sort: { sortBy: sortType } });
    }

    MQLBuilder.push(
      {
        $facet: {
          total: [
            {
              $count: "groups",
            },
          ],
          data: [
            {
              $addFields: {
                _id: "$_id",
              },
            },
          ],
        },
      },
      { $unwind: "$total" },
      {
        $project: {
          items: {
            $slice: [
              "$data",
              skip,
              {
                $ifNull: [limit, "$total.groups"],
              },
            ],
          },
          meta: {
            total: "$total.groups",
            limit: {
              $literal: limit,
            },

            page: {
              $literal: skip / limit + 1,
            },
            pages: {
              $ceil: {
                $divide: ["$total.groups", limit],
              },
            },
          },
        },
      }
    );

    const cashouts = await Transaction.aggregate(MQLBuilder);

    callback(...cashouts);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getCashOuts", error, req, res);
  }
};

module.exports.getCashIns = async (req, res, callback) => {
  try {
    const MQLBuilder = [
      { $match: { isDeleted: false, type: 1 } },
      { $sort: { createdAt: -1 } },
    ];
    const skip = req.query.skipCount ? Number(req.query.skipCount) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const searchText = req.query.searchText;
    const searchBy = req.query.searchBy;
    const sortBy = req.query.sortBy ?? "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    if (searchText) {
      MQLBuilder[0]["$match"][searchBy] = {
        $regex: searchText,
        $options: "i",
      };
    }

    if (sortBy !== "createdAt") {
      MQLBuilder.push({ $sort: { sortBy: sortType } });
    }

    MQLBuilder.push(
      {
        $facet: {
          total: [
            {
              $count: "groups",
            },
          ],
          data: [
            {
              $addFields: {
                _id: "$_id",
              },
            },
          ],
        },
      },
      { $unwind: "$total" },
      {
        $project: {
          items: {
            $slice: [
              "$data",
              skip,
              {
                $ifNull: [limit, "$total.groups"],
              },
            ],
          },
          meta: {
            total: "$total.groups",
            limit: {
              $literal: limit,
            },

            page: {
              $literal: skip / limit + 1,
            },
            pages: {
              $ceil: {
                $divide: ["$total.groups", limit],
              },
            },
          },
        },
      }
    );

    const cashouts = await Transaction.aggregate(MQLBuilder);

    callback(...cashouts);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getCashIns", error, req, res);
  }
};
