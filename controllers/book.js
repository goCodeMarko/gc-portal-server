const
    padayon = require('../helpers/padayon'),
    path = require('path'),
    base = path.basename(__filename, '.js'),
    model = require(`./../models/${base}`);
let $global = { success: true, data: [], message: '', code: 200};




module.exports.getBooks = async (req, res) => {
    try {
        await model.getBooks(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::Book::getBooks', error, req, res)
    }finally{
        return $global;
    }
}; 

module.exports.deleteBook = async (req, res, callback) => {
    try {
        await model.deleteBook(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        ;
        padayon.errorHandler('Controller::Book::deleteBook', error, req, res)
    } finally {
        return $global;
    }
}; 

module.exports.editBook = async (req, res) => {
    try {
        await model.editBook(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        ;
        padayon.errorHandler('Controller::Book::editBook', error, req, res)
    } finally {
        return $global;
    }
}; 

module.exports.addBook = async (req, res) => {
    try {
        await model.addBook(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::Book::addBook', error, req, res)
    } finally {
        return $global;
    }
}; 