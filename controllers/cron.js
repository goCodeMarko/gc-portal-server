const
    path = require('path'),
    base = path.basename(__filename, '.js'),
    bookModel = require(`./../models/book`);


module.exports.getBooks = (req, res, callback) => {
    bookModel.getBooks(req, (result) => {
        callback(result);
    });
};
