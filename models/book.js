'use_strict';

const
    padayon = require('../helpers/padayon'),
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb'),
    lib = require('../helpers/padayon');
let $global = { queryResult: null };

Book = mongoose.model(base, mongoose.Schema({
    title:          { type: String, required: true },
    author:         { type: String, default: 0, required: true },
    price:          { type: Number, required: true },
    stocks:         { type: Number, default:0, required: true },
    isdeleted:      { type: Boolean, default: false },
    datecreated:    { type: Date, default: new Date()}
}));


module.exports.getBooks =  async (req, res, callback) => {
    try {
        let MQLBuilder = [
            { '$match': { 'isdeleted': false } }
        ];

        if (req?.query?.search) {
            MQLBuilder[0]['$match']['title'] = { '$regex': req.query.search, $options: 'i' }
        }

        let bookCount = await Book.aggregate(MQLBuilder);

        MQLBuilder.push(
            { '$sort': { 'datecreated': -1 } },
            { '$skip': +req?.query?.skip || 0 },
            { '$limit': +req?.query?.limit || 10 }
        );

        let books = await Book.aggregate(MQLBuilder);

        $global.queryResult = {
            counts: bookCount.length,
            pages: Math.ceil(bookCount.length / 2),
            data: books
        }
    } catch (error) {
        padayon.errorHandler('Model::Book::getBooks', error, req, res)
    } finally {
        callback($global.queryResult);
    }
};

module.exports.deleteBook = async (req, res, callback) => {
    try {
        const id = req.body.id;
        const result = await Book.updateOne(
            { _id: id },
            { $set: { isdeleted: true } }
        )

        $global.queryResult = result
    } catch (error) {
        padayon.errorHandler('Model::Book::deleteBook', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}

module.exports.editBook = async (req, res, callback) => {
    try {
        const id = req.body.oldData._id;

        const result = await Book.updateOne(
            { _id: id },
            {
                $set: {
                    title: req.body.newData.updateddata.title,
                    author: req.body.newData.updateddata.author,
                    stocks: +req.body.newData.updateddata.stocks,
                    price: +req.body.newData.updateddata.price,
                }
            }
        )

        $global.queryResult = result
    } catch (error) {
        padayon.errorHandler('Model::Book::editBook', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}

module.exports.addBook = async (req, res, callback) => {
    try {
        const data = req.body;
        const newBook = new Book(data);
        const insert = await newBook.save();

        $global.queryResult = insert;
    } catch (error) {
        padayon.errorHandler('Model::Book::addBook', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}
    



