const { Console } = require('console');
const { start } = require('repl');

const
    padayon = require('../helpers/padayon'),
    path = require('path'),
    base = path.basename(__filename, '.js'),
    model = require(`./../models/${base}`),
    bookController = require(`./../controllers/book`),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    qrcode = require('./../helpers/qrcode'),
    pdf = require('./../helpers/pdf'),
    excel = require('./../helpers/excel'),
    cloudinary = require('./../helpers/cloudinary');
let $global = { success: true, data: [], message: '', code: 200 };



module.exports.getUser = async (req, res) => {
    try {
        await model.getUser(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::User::getUser', error, req, res )
    } finally {
        return $global;
    }
};

module.exports.getUsers = async (req, res) => {
    try {
        await model.getUsers(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::User::getUsers', error, req, res)
    } finally {
        return $global;
    }
};

module.exports.authenticate = async (req, res) => {
    try {
        await model.authenticate(req, res, (result) => {
            if (result.length) {
                //account exists
                if (result[0].isblock) {
                    //blocked account
                    $global.success = false;
                    $global.message = 'Your account has been block'
                    
                } else {
                    //log in success
                    const token = jwt.sign(result[0], process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

                    // set token as cookie
                    res.cookie('xxxx', token, { 
                        httpOnly: true, 
                        maxAge: 86400000 
                    });

                    $global.success = true;
                    $global.message = '';

                    $global.data = { token, account: result[0] }
                }
            } else {
                //account does'nt exists

                $global.success = false;
                $global.message = 'Username or Password is incorrect';

            }
        });
    } catch (error) {
        padayon.errorHandler('Controller::User::authenticate', error, req, res)
    } finally {
        return $global;
    }
};

module.exports.updateUserAccess = async (req, res) => {
    try {
        await model.updateUserAccess(req, res, (result) => {
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::User::updateUserAccess', error, req, res)
    } finally {
        return $global;
    }
};

module.exports.checkAccess = async (properties, req, res) => {
    try {
        await model.checkAccess(properties, req, res, (result) => {
            $global.success = result.length ? true : false;
            $global.data = result;
        });
    } catch (error) {
        padayon.errorHandler('Controller::User::checkAccess', error, req, res)
    } finally {
        return $global;
    }
};

module.exports.saveFile = async (req, res) => {
    try {
        const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures',
            type: 'authenticated',
            resource_type: 'auto'
            // allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
        });

        $global.data = upload;
    } catch (error) {
        padayon.errorHandler('Controller::User::saveFile', error, req, res)
    } finally {
        return $global;
    }
};

module.exports.generateQR = async (req, res) => {
    try {
        const result = await qrcode.generate();

        $global.data = result;
    } catch (error) {
        padayon.errorHandler('Controller::User::generateQR', error, req, res)
    } finally {
        return $global;
    }
}

module.exports.getFile = async (req, res) => {
    try {
        const public_id = req.query.public_id;

        const url = await fetchFile(public_id, {
            sign_url: true,
            type: "authenticated",
            transformation: {
                radius: 10
            }
        });

        $global.data = url;
    } catch (error) {
        padayon.errorHandler('Controller::User::getFile', error, req, res)
    } finally {
        return $global;
    }
}

module.exports.downloadPDF = async (req, res) => {
    try {
        const public_id = req.query.public_id;
        const qrcodeURL = await fetchFile(public_id, {
            sign_url: true,
            type: "authenticated",
            transformation: {
                radius: 10
            }
        });

        let books = await bookController.getBooks(req, res);

        let options = {
            template: 'templates/unknown_report.html',
            cloudinaryFolder: 'unknown_reports',
            format: 'Legal',
            data: {
                data: books.data.data,
                columns: ['AUTHOR', 'STOCKS', 'TITLE', 'PRICE'],
                qrcodeURL
            }
        };
        
        const result = await pdf.generate(options);

        $global.data = result;
    } catch (error) {
        console.log(error);
        padayon.errorHandler('Controller::User::downloadPDF', error, req, res)
    } finally {
        return $global;
    }
}


module.exports.downloadExcel = async (req, res) => {
  
    try {
        let books = await bookController.getBooks(req, res);

        const details = await excel.generate({
            sheetName: 'Sheet#1',
            header: {
                start: 'A1',
                title: 'Unknown Report'
            },
            table: {
                start: 'A4',
                fields: ['AUTHOR', 'STOCKS', 'TITLE', 'PRICE'],
                data: books.data.data,
                dataKeys: ['author', 'stocks', 'title', 'price']
            }
        });
        $global.data = details;

    } catch (error) {
        console.log(error);
        padayon.errorHandler('Controller::User::downloadExcel', error, req, res)
    } finally {

        return $global;
    }
}

async function fetchFile(public_id, options) {
    const file = await cloudinary.image(public_id, options);
    const start = file.indexOf("'") + 1;
    const end = file.lastIndexOf("'");
    const url = file.slice(start, end);

    return url;
}