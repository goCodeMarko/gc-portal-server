'use_strict';

const
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb'),
    lib = require('../library'),


    Book = mongoose.model(base, mongoose.Schema({
        title: { type: String, required: true },
        author: { type: String, default: 0, required: true },
        price: { type: Number, required: true },
        stocks: { type: Number, default:0, required: true },
        isdeleted: { type: Boolean, default: false },
        datecreated: { type: Date, default: lib.getcurrentdate() }
    }));


module.exports.getBooks =  async (req, callback) => {
        console.log(req.query);
        let MQLBuilder = [
            { '$match': { 'isdeleted': false } }
        ];

        if (req.query.search){
            MQLBuilder[0]['$match']['title'] = { '$regex': req.query.search, $options: 'i' } 
        }

        let bookCount = await Book.aggregate(MQLBuilder);

        MQLBuilder.push(
            { '$sort': { 'datecreated': -1 } },
            { '$skip': +req.query.skip },
            { '$limit': +req.query.limit }
        );

        let books = await Book.aggregate(MQLBuilder);

        result = {
            counts: bookCount.length,
            pages: Math.ceil(bookCount.length / 2),
            data: books
        }

        callback({ success: true, result: result, code: 200});
};

module.exports.deleteBook = async (req, callback) => {
        const id = req.body.id;
        const result = await Book.updateOne(
            { _id : id },
            { $set: { isdeleted: true} }
        )

        callback({ success: true, data: result, code: 200});
        
};

module.exports.editBook = async (req, callback) => {
        const id = req.body.oldData._id;
        console.log(req.body)
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
}

module.exports.addBook = async (req, callback) => {
    const data = req.body;
    const newBook = new Book(data);
    const insert = await newBook.save();

    callback({ success: true, data: insert, code: 201});
}
    



