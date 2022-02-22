'use_strict';

const
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb'),
    lib = require('./../library'),


    Book = mongoose.model(base, mongoose.Schema({
        title: { type: String, required: true },
        author: { type: String, default: 0, required: true },
        price: { type: Number, required: true },
        stocks: { type: Number, default:0, required: true },
        isdeleted: { type: Boolean, default: false },
        datecreated: { type: Date, default: lib.getcurrentdate() }
    }));

module.exports.methods = {

    allBooks: async (req, callback) => {
        const result = await Book.aggregate([
            {
                $match: {
                    isdeleted: false
                }
            },
            {
                $sort: {
                    'datecreated': -1
                }
            }
        ]);
        
        callback({ success: true, data: result, code: 200});
    },

    deleteBook: async (req, callback) => {
        const id = req.body.id;
        const result = await Book.updateOne(
            { _id : id },
            { $set: { isdeleted: true} }
        )

        callback({ success: true, data: result, code: 200});
        
    },

    editBook: async (req, callback) => {
        const id = req.body.oldData._id;
        const result = await Book.updateOne(
            { _id : id },
            { 
                $set: { 
                    title: req.body.newData.updateddata.title,
                    author: req.body.newData.updateddata.author,
                    stocks: +req.body.newData.updateddata.stocks,
                    price: +req.body.newData.updateddata.price,
                } 
            }
        )

        callback({ success: true, data: result, code: 201});
    },

    addBook: async (req, callback) => {
        const data = req.body;
        const newBook = new Book(data);
        const insert = await newBook.save();

        callback({ success: true, data: insert, code: 200});
    }
    
};


