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

module.exports.getTransaction = async (req, res) => {
  try {
    let response = {};
    const { startDate, endDate } = req.fnParams;

    // Convert local time to UTC using the client's timezone
    const utcStartDateTime = moment
      .tz(startDate, "YYYY-MM-DDTHH:mm:ss", req.timezone)
      .utc();
    const utcEndDateTime = moment
      .tz(endDate, "YYYY-MM-DDTHH:mm:ss", req.timezone)
      .utc();
    const startDateUTC = utcStartDateTime.toISOString();
    const endDateUTC = utcEndDateTime.toISOString();
    console.log(45, startDateUTC);
    console.log(45, endDateUTC);
    const [transaction] = await Transaction.aggregate([
      {
        $match: {
          isDeleted: false,
          date: {
            $gte: new Date(startDateUTC),
            $lte: new Date(endDateUTC),
          },
        },
      },
      {
        $project: {
          date: 1,
          gcash: 1,
          runbal_gcash: {
            $sum: [
              "$gcash",
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $eq: ["$$ci.status", 2] },
                    },
                  },
                  initialValue: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: "$cashin",
                          as: "ci",
                          cond: {
                            $and: [
                              { $eq: ["$$ci.fee_payment_is_gcash", true] },
                              { $eq: ["$$ci.status", 2] },
                            ],
                          },
                        },
                      },
                      initialValue: {
                        $reduce: {
                          input: {
                            $filter: {
                              input: "$cashout",
                              as: "co",
                              cond: { $eq: ["$$co.status", 2] },
                            },
                          },
                          initialValue: {
                            $reduce: {
                              input: {
                                $filter: {
                                  input: "$cashout",
                                  as: "co",
                                  cond: {
                                    $and: [
                                      {
                                        $eq: [
                                          "$$co.fee_payment_is_gcash",
                                          true,
                                        ],
                                      },
                                      { $eq: ["$$co.status", 2] },
                                    ],
                                  },
                                },
                              },
                              initialValue: 0,
                              in: { $sum: ["$$value", "$$this.fee"] },
                            },
                          },
                          in: { $sum: ["$$value", "$$this.amount"] },
                        },
                      },
                      in: { $sum: ["$$value", "$$this.fee"] },
                    },
                  },
                  in: { $subtract: ["$$value", "$$this.amount"] },
                },
              },
            ],
          },
          cash_on_hand: 1,
          runbal_cash_on_hand: {
            $sum: [
              "$cash_on_hand",
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $eq: ["$$ci.status", 2] },
                    },
                  },
                  initialValue: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: "$cashin",
                          as: "ci",
                          cond: {
                            $and: [
                              { $eq: ["$$ci.fee_payment_is_gcash", false] },
                              { $eq: ["$$ci.status", 2] },
                            ],
                          },
                        },
                      },
                      initialValue: {
                        $reduce: {
                          input: {
                            $filter: {
                              input: "$cashout",
                              as: "co",
                              cond: { $eq: ["$$co.status", 2] },
                            },
                          },
                          initialValue: {
                            $reduce: {
                              input: {
                                $filter: {
                                  input: "$cashout",
                                  as: "co",
                                  cond: {
                                    $and: [
                                      {
                                        $eq: [
                                          "$$co.fee_payment_is_gcash",
                                          false,
                                        ],
                                      },
                                      { $eq: ["$$co.status", 2] },
                                    ],
                                  },
                                },
                              },
                              initialValue: 0,
                              in: { $sum: ["$$value", "$$this.fee"] },
                            },
                          },
                          in: { $subtract: ["$$value", "$$this.amount"] },
                        },
                      },
                      in: { $sum: ["$$value", "$$this.fee"] },
                    },
                  },
                  in: { $sum: ["$$value", "$$this.amount"] },
                },
              },
            ],
          },
          report: 1,
          isDeleted: 1,
          gcashNumber: 1,
          createdAt: 1,
          cashin: 1,
          cashout: 1,
        },
      },
    ]);

    console.log(3534);

    response = transaction;
    return response;
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getTransaction", error, req, res);
  }
}; //---------done

module.exports.createTransaction = async (req, res, callback) => {
  try {
    let response = {};
    const body = req.fnParams;

    const transaction = new Transaction(body);
    const result = await transaction.save();

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler(
      "Model::Transaction::createTransaction",
      error,
      req,
      res
    );
  }
}; //---------done

module.exports.getCashOuts = async (req, res) => {
  try {
    const skip = req.query.skipCount ? Number(req.query.skipCount) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const searchText = req.query.searchText;
    const searchBy = req.query.searchBy;
    const sortBy = req.query.sortBy ?? "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;

    const MQLBuilder = [
      { $match: { _id: ObjectId(req.query?.transaction_id) } },
      { $unwind: { path: "$cashout" } },
      {
        $project: {
          amount: {
            $cond: {
              if: "$cashout.fee_payment_is_gcash",
              then: { $sum: ["$cashout.amount", "$cashout.fee"] },
              else: "$cashout.amount",
            },
          },
          fee: "$cashout.fee",
          fee_payment_is_gcash: "$cashout.fee_payment_is_gcash",
          snapshot: "$cashout.snapshot",
          status: "$cashout.status",
          note: "$cashout.note",
          isDeleted: "$cashout.isDeleted",
          _id: "$cashout._id",
          type: "$cashout.type",
          phone_number: "$cashout.phone_number",
          createdAt: "$cashout.createdAt",
          updatedAt: "$cashout.updatedAt",
        },
      },
      { $match: { isDeleted: false, type: 2 } },
    ];

    let searchCriteria = {};
    searchCriteria[searchBy] = {
      $regex: searchText,
      $options: "i",
    };
    if (searchText) MQLBuilder.push({ $match: searchCriteria });

    let sortCriteria = {};
    sortCriteria[sortBy] = sortType;
    MQLBuilder.push({ $sort: sortCriteria });

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

    const [cashouts] = await Transaction.aggregate(MQLBuilder);

    return cashouts;
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getCashOuts", error, req, res);
  }
};

module.exports.addTransaction = async (req, res, callback) => {
  try {
    let response = {};
    const body = req.fnParams;

    const result = await Transaction.findByIdAndUpdate(
      { _id: ObjectId(body.trans_id) },
      body.type === 1
        ? { $push: { cashin: body } }
        : { $push: { cashout: body } },
      { new: true }
    );
    console.log(3333, result);
    const cash =
      body.type === 1
        ? result.cashin[result.cashin.length - 1]
        : result.cashout[result.cashout.length - 1];
  
    if(cash.type === 2 && cash.fee_payment_is_gcash){
      cash.amount = cash.amount + cash.fee
    }else if(cash.type === 1 && cash.fee_payment_is_gcash) {
      cash.amount = cash.amount - cash.fee
    }
    response = cash; 
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::addTransaction", error, req, res);
  }
}; //---------done

module.exports.updateCICO = async (req, res, callback) => {
  try {
    let response = {};
    const { type, phone_number, amount, fee, fee_payment_is_gcash, snapshot, note, trans_id, cid} = req.fnParams;
 
    const set =
      type === 1
        ? {
            $set: {
              "cashin.$[elem].note": note,
              "cashin.$[elem].fee": fee,
              "cashin.$[elem].fee_payment_is_gcash": fee_payment_is_gcash,
              "cashin.$[elem].amount": amount,
              "cashin.$[elem].phone_number": phone_number,
            },
          }
        : { 
          $set: { 
            "cashout.$[elem].note": note,
            "cashout.$[elem].fee": fee,
            "cashout.$[elem].fee_payment_is_gcash": fee_payment_is_gcash,
            "cashout.$[elem].snapshot": snapshot,
            "cashout.$[elem].amount": amount,
          } 
        };

    const result = await Transaction.updateOne(
      { _id: ObjectId(trans_id) },
      set,
      {
        arrayFilters: [{ "elem._id": ObjectId(cid) }],
        multi: true,
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::updateCICO", error, req, res);
  }
}; //---------done

module.exports.updateTransactionStatus = async (req, res, callback) => {
  try {
    let response = {};
    const { status, cid, trans_id, screenshot, type } = req.fnParams;
    console.log(33, type);
    const set =
      type === 1
        ? {
            $set: {
              "cashin.$[elem].status": status,
              "cashin.$[elem].snapshot": screenshot ? screenshot : "",
            },
          }
        : { $set: { "cashout.$[elem].status": status } };

    const result = await Transaction.updateOne(
      { _id: ObjectId(trans_id) },
      set,
      {
        arrayFilters: [{ "elem._id": ObjectId(cid) }],
        multi: true,
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

module.exports.getCashIns = async (req, res) => {
  try {
    const skip = req.query.skipCount ? Number(req.query.skipCount) : 0;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const searchText = req.query.searchText;
    const searchBy = req.query.searchBy;
    const sortBy = req.query.sortBy ?? "createdAt";
    const sortType = req.query.sortType === "asc" ? 1 : -1;
    const MQLBuilder = [
      { $match: { _id: ObjectId(req.query?.transaction_id) } },
      { $unwind: { path: "$cashin" } },
      {
        $project: {
          amount: {
            $cond: {
              if: "$cashin.fee_payment_is_gcash",
              then: { $subtract: ["$cashin.amount", "$cashin.fee"] },
              else: "$cashin.amount",
            },
          },
          fee: "$cashin.fee",
          fee_payment_is_gcash: "$cashin.fee_payment_is_gcash",
          snapshot: "$cashin.snapshot",
          status: "$cashin.status",
          note: "$cashin.note",
          isDeleted: "$cashin.isDeleted",
          _id: "$cashin._id",
          type: "$cashin.type",
          phone_number: "$cashin.phone_number",
          createdAt: "$cashin.createdAt",
          updatedAt: "$cashin.updatedAt",
        },
      },
      { $match: { isDeleted: false, type: 1 } },
    ];

    let searchCriteria = {};
    searchCriteria[searchBy] = {
      $regex: searchText,
      $options: "i",
    };
    if (searchText) {
      MQLBuilder.push({ $match: searchCriteria });
    }

    let sortCriteria = {};
    sortCriteria[sortBy] = sortType;
    MQLBuilder.push({ $sort: sortCriteria });

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

    const [cashins] = await Transaction.aggregate(MQLBuilder);

    return cashins;
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getCashIns", error, req, res);
  }
};
