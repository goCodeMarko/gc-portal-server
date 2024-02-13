const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  _ = require("lodash"),
  { bookDTO } = require("../services/dto"),
  model = require(`./../models/${base}`);

module.exports.getBooks = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    await model.getBooks(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::Book::getBooks", error, req, res);
  }
};

module.exports.deleteBook = async (req, res, callback) => {
  try {
    let response = { success: true, code: 200 };

    req.fnParams = {
      bookId: req.params?.id,
    };
    await model.deleteBook(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.nModified, 1))
        throw new padayon.BadRequestException(
          "Unsuccessful book deletion. Please try again."
        );

      response.data = result;
    });

    req.query = {
      ...req.body,
      skip: req.body.limit - 1,
      limit: 1,
    };
    console.log(3333, req.query);
    await model.getBooks(req, res, (result) => {
      response.data = result;
    });

    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::Book::deleteBook", error, req, res);
  }
}; //---------done

module.exports.updateBook = async (req, res) => {
  try {
    let response = { success: true, code: 200 };

    const body = {
      title: req?.body?.title,
      author: req?.body?.author,
      price: req?.body?.price,
      stocks: req?.body?.stocks,
    };

    await bookDTO.validateAsync(body);

    req.fnParams = {
      ...body,
      _id: req?.params?.id,
    };

    await model.updateBook(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.n, 1))
        throw new padayon.BadRequestException("Book not found.");
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::Book::updateBook", error, req, res);
  }
}; //---------done

module.exports.addBook = async (req, res) => {
  try {
    let response = { success: true, code: 201 };

    const body = {
      title: req?.body?.title,
      author: req?.body?.author,
      price: req?.body?.price,
      stocks: req?.body?.stocks,
    };

    await bookDTO.validateAsync(body);

    req.fnParams = {
      ...body,
    };

    await model.addBook(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::Book::addBook", error, req, res);
  }
}; //---------done
