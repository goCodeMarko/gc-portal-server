"use_strict";

const { ObjectId } = require("mongodb");

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
    let response = {};
    let MQLBuilder = [{ $match: { isDeleted: false } }];
    console.log(3345345, req?.query?.search);
    if (req?.query?.search) {
      MQLBuilder[0]["$match"]["title"] = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    let bookCount = await Book.aggregate(MQLBuilder);

    MQLBuilder.push(
      { $sort: { createdAt: -1 } },
      { $skip: +req?.query?.skip || 0 },
      { $limit: +req?.query?.limit || 10 }
    );
    console.log("-------MQLBuilder", MQLBuilder);
    let books = await Book.aggregate(MQLBuilder);

    response = {
      counts: bookCount.length,
      pages: Math.ceil(bookCount.length / 2),
      data: books,
    };
    callback(response);
  } catch (error) {
    padayon.ErrorHandler("Model::Book::getBooks", error, req, res);
  }
};

module.exports.deleteBook = async (req, res, callback) => {
  try {
    let response = {};
    const { bookId } = req.fnParams;

    const result = await Book.updateOne(
      { _id: ObjectId(bookId) },
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
