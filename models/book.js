"use_strict";
const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename).split(".").shift(),
  mongoose = require("mongoose");

Book = mongoose.model(
  base,
  mongoose.Schema(
    {
      title: { type: String, required: true, lowercase: true },
      author: { type: String, default: 0, required: true },
      price: { type: Number, required: true },
      stocks: { type: Number, default: 0, required: true },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  )
);

module.exports.getBooks = async (req, res, callback) => {
  try {
    const MQLBuilder = [
      { $match: { isDeleted: false } },
      { $sort: { createdAt: -1 } },
    ];
    const skip = req.query.skip ? Number(req.query.skip) : 0;
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

    const books = await Book.aggregate(MQLBuilder);

    callback(...books);
  } catch (error) {
    padayon.ErrorHandler("Model::Book::getBooks", error, req, res);
  }
};

module.exports.deleteBook = async (req, res, callback) => {
  try {
    let response = {};
    const { bookId } = req.fnParams;

    const result = await Book.updateOne(
      { _id: new mongoose.Types.ObjectId(bookId) },
      { $set: { isDeleted: true } }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Book::deleteBook", error, req, res);
  }
}; //---------done

module.exports.updateBook = async (req, res, callback) => {
  try {
    let response = {};
    const { _id, title, author, stocks, price } = req.fnParams;

    const result = await Book.updateOne(
      { _id: Object(_id) },
      {
        $set: {
          title: title,
          author: author,
          stocks: stocks,
          price: price,
        },
      }
    );

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Book::updateBook", error, req, res);
  }
}; //---------done

module.exports.addBook = async (req, res, callback) => {
  try {
    let response = {};
    const body = req.fnParams;

    const newBook = new Book(body);
    const result = await newBook.save();

    response = result;
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Book::addBook", error, req, res);
  }
}; //---------done
