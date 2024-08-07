"use_strict";
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
          cashout_stats: {
            total_amount: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashout",
                      as: "co",
                      cond: { $eq: ["$$co.status", 2] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.amount"] },
              } 
            }, 
            gcash_fee: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashout",
                      as: "co",
                      cond: { $and : [ { $eq: ["$$co.status", 2] }, { $eq: ["$$co.fee_payment_is_gcash", true] } ] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.fee"] },
              } 
            }, 
            cash_fee: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashout",
                      as: "co",
                      cond: { $and : [ { $eq: ["$$co.status", 2] }, { $eq: ["$$co.fee_payment_is_gcash", false] } ] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.fee"] },
              } 
            }, 
            pending: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$cashout",
                      as: "co",
                      cond: { $eq: ["$$co.status", 1] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", 1] },
                } 
            },
            approved: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashout",
                    as: "co",
                    cond: { $eq: ["$$co.status", 2] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
           },
           failed: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashout",
                    as: "co",
                    cond: { $eq: ["$$co.status", 3] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
            },
            cancelled: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashout",
                    as: "co",
                    cond: { $eq: ["$$co.status", 4] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
            }
          },
          cashin_stats: {
            total_amount: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $eq: ["$$ci.status", 2] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.amount"] },
              } 
            }, 
            gcash_fee: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $and : [ { $eq: ["$$ci.status", 2] }, { $eq: ["$$ci.fee_payment_is_gcash", true] } ] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.fee"] },
              } 
            }, 
            cash_fee: {
              $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $and : [ { $eq: ["$$ci.status", 2] }, { $eq: ["$$ci.fee_payment_is_gcash", false] } ] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", "$$this.fee"] },
              } 
            }, 
            pending: {
                $reduce: {
                  input: {
                    $filter: {
                      input: "$cashin",
                      as: "ci",
                      cond: { $eq: ["$$ci.status", 1] },
                    }
                  },
                  initialValue: 0,
                  in: { $sum: ["$$value", 1] },
                } 
            },
            approved: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashin",
                    as: "ci",
                    cond: { $eq: ["$$ci.status", 2] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
           },
           failed: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashin",
                    as: "ci",
                    cond: { $eq: ["$$ci.status", 3] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
            },
            cancelled: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$cashin",
                    as: "ci",
                    cond: { $eq: ["$$ci.status", 4] },
                  }
                },
                initialValue: 0,
                in: { $sum: ["$$value", 1] },
              } 
            }
          },
        }
      }
    ]);

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
      { $match: { _id: new mongoose.Types.ObjectId(req.query?.transaction_id) } },
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
          createdBy: "$cashout.createdBy",
          updatedBy: "$cashout.updatedBy",
        },
      },
      { $match: { isDeleted: false, type: 2 } },
      { 
        $lookup : {
          from: 'users',            
          localField: 'createdBy',       
          foreignField: '_id',      
          as: 'c'   
       }
      },
      { $unwind: { path: "$c" } },
      { 
        $lookup : {
          from: 'users',            
          localField: 'updatedBy',       
          foreignField: '_id',    
          as: 'u'       
        }
      },
      { $unwind: { path: "$u" } },
      {
        $project: {
          amount: 1,
          fee: 1,
          fee_payment_is_gcash: 1,
          snapshot: 1,
          status: 1,
          note: 1,
          isDeleted: 1,
          _id: 1,
          type: 1,
          phone_number: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: { $concat: ["$c.firstname", " ", "$c.lastname"] },
          updatedBy:{ $concat: ["$c.firstname", " ", "$c.lastname"] },
        },
      },
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

module.exports.addTransaction = async (req, res) => {
  try {
    const body = req.fnParams; // Extract the request parameters

    // Find the transaction by ID and update it by pushing the new cashin or cashout object
    const query = await Transaction.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(body.trans_id) }, // Find the transaction by its ID
      body.type == 1 // Determine the type of transaction
        ? { $push: { cashin: body } } // If type is 1, push to the 'cashin' array
        : { $push: { cashout: body } }, // If type is not 1, push to the 'cashout' array
      { new: true } // Return the modified document
    );

    // Get the last added cash object from the result based on the type
    let cash = body.type === 1
        ? query.cashin[query.cashin.length - 1] // Get the last element in the 'cashin' array
        : query.cashout[query.cashout.length - 1]; // Get the last element in the 'cashout' array

    let cashPlainObject = cash.toObject(); // Convert the Mongoose document to a plain JavaScript object

    // Adjust the amount based on the type and fee payment method
    if(cashPlainObject.type === 2 && cashPlainObject.fee_payment_is_gcash)
      cashPlainObject.amount = cashPlainObject.amount + cashPlainObject.fee; // Add fee to the amount if it's type 2 and fee is paid via gcash
    else if(cashPlainObject.type === 1 && cashPlainObject.fee_payment_is_gcash) 
      cashPlainObject.amount = cashPlainObject.amount - cashPlainObject.fee; // Subtract fee from the amount if it's type 1 and fee is paid via gcash
   
    // Set the createdBy and updatedBy fields with the full name from the authenticated user
    cashPlainObject.createdBy = req.auth.fullname;
    cashPlainObject.updatedBy = req.auth.fullname;

    return cashPlainObject;  // Return the modified cash object
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::addTransaction", error, req, res);
  }
};

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
      { _id: new mongoose.Types.ObjectId(trans_id) },
      set,
      {
        arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(cid) }],
        multi: true,
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::updateCICO", error, req, res);
  }
}; //---------done

module.exports.updateTransactionStatus = async (req, res) => {
  try {
    let response = {};
    const { status, cid, trans_id, screenshot, type } = req.fnParams;
    
    const set =
      type === 1 
        ?  status === 2 ? {
            $set: {
              "cashin.$[elem].status": status,
              "cashin.$[elem].snapshot": screenshot,
            },
          } : { $set: { "cashin.$[elem].status": status } }
        : { $set: { "cashout.$[elem].status": status } };

    const result = await Transaction.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(trans_id) },
      set,
      {
        arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(cid) }],
        multi: true,
        new: true
      }
    );
    response = result;
    return response;
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
      { $match: { _id: new mongoose.Types.ObjectId(req.query?.transaction_id) } },
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
          createdBy: "$cashin.createdBy",
          updatedBy: "$cashin.updatedBy",
        },
      },
      { $match: { isDeleted: false, type: 1 } },
      { 
        $lookup : {
          from: 'users',            
          localField: 'createdBy',       
          foreignField: '_id',      
          as: 'c'   
       }
      },
      { $unwind: { path: "$c" } },
      { 
        $lookup : {
          from: 'users',            
          localField: 'updatedBy',       
          foreignField: '_id',    
          as: 'u'       
        }
      },
      { $unwind: { path: "$u" } },
      {
        $project: {
          amount: 1,
          fee: 1,
          fee_payment_is_gcash: 1,
          snapshot: 1,
          status: 1,
          note: 1,
          isDeleted: 1,
          _id: 1,
          type: 1,
          phone_number: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: { $concat: ["$c.firstname", " ", "$c.lastname"] },
          updatedBy:{ $concat: ["$c.firstname", " ", "$c.lastname"] },
        },
      }
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
    console.log(323432, cashins)

    return cashins;
  } catch (error) {
    padayon.ErrorHandler("Model::Transaction::getCashIns", error, req, res);
  }
};
