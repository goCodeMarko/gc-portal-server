const
    path = require('path'),
    base = path.basename(__filename, '.js'),
    model = require(`./../models/${base}`);


module.exports.getBooks = (req, res, callback) => {
    const count = getAuthor();

    model.getBooks(req, (result) => {
        console.log('getBooks', result)
        callback(result);
    });
}; 

module.exports.deleteBook = (req, res, callback) => {
    model.deleteBook(req, (result) => {
        callback(result);
    });
}; 

module.exports.editBook = (req, res, callback) => {
    model.editBook(req, (result) => {
        callback(result);
    });
}; 

module.exports.addBook = (req, res, callback) => {
    model.addBook(req, (result) => {
        callback(result);
    });
}; 

function getAuthor(req) {
    return 12;
};