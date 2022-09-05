const { Console } = require('console');

const
    path = require('path'),
    base = path.basename(__filename, '.js'),
    model = require(`./../models/${base}`),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    qrcode = require('./../utils/qrcode'),
    PDFDocument = require('pdfkit'),
    fs = require('fs'),
    pdf = require('./../utils/pdf'),
    cloudinary = require('./../utils/cloudinary');


module.exports.getUser = (req, res, callback) => {
    model.getUser(req, (result) => {
        callback(result);
    });
};

module.exports.getUsers = (req, res, callback) => {
    model.getUsers(req, (result) => {
        callback(result);
    });
};

module.exports.authenticate = (req, res, callback) => {
    model.authenticate(req, (result) => {
        if (result.length) {
            //account exists
            if (result[0].isblock) {
                //blocked account
                callback({ success: false, data: [], code: 200, message: 'Your account has been block' });
            } else {
                //log in success
                const token = jwt.sign(result[0], process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

                //set token as cookie
                res.cookie('xxxx', token, { 
                    httpOnly: true, 
                    maxAge: 86400000 
                });

                callback({ success: true, data: { token, account: result[0] }, code: 200 });
            }
        } else {
            //account does'nt exists
            callback({ success: false, data: [], code: 200, message: 'Username or Password is incorrect' });
        }
    });
};

module.exports.updateUserAccess = (req, res, callback) => {
    model.updateUserAccess(req, (result) => {
        callback(result);
    });
};

module.exports.checkAccess = (properties, callback) => {
    model.checkAccess(properties, (result) => {
        callback(result.data);
    });
};

module.exports.saveFile = async (req, res, callback) => {
    const upload = await cloudinary.uploader.upload(req.file.path, { 
        folder: 'profile_pictures',
        type: "authenticated",
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
    });

    callback({ success: true, data: upload, code: 200, message: ''});
};

module.exports.generateQR = async (req, res, callback) => {
    const result = await qrcode.generate();

    callback({ success: true, data: result, code: 200});
}

module.exports.getFile = async (req, res, callback) => {
    const public_id = req.query.public_id;
    const file = await cloudinary.image(public_id, {
        sign_url: true, 
        type: "authenticated",
        transformation: {
            radius: 10
        }
    });
    const start = file.indexOf("'") + 1;
    const end = file.lastIndexOf("'");
    const url = file.slice(start, end);
    callback({ success: true, data: url, code: 200 });
}

module.exports.downloadPDF = async (req, res, callback) => {
    const options = {
        template: 'template/qrcode/qrcode.html',
        cloudinaryFolder: 'pdf_files',
        format: 'A5',
        data: [
            {
                name: "Shyam",
                age: "26",
                name: "Shyam",
                name: "Shyam",

            },
            {
                name: "Navjot",
                age: "26",
                name: "Shyam",
                name: "Shyam",

            },
            {
                name: "Vitthal",
                age: "26",
                name: "Shyam",
                name: "Shyam",

            },
        ]
    }
    const result = await pdf.generate(options);

    callback({ success: true, data: result, code: 200 });
}
