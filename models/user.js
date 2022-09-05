'use_strict';


const
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb');

User = mongoose.model(base, mongoose.Schema({
    email: { type: String, maxlength: 50, required: true },
    password: { type: String, maxlength: 50 },
    role: { type: String, maxlength: 20, default: 'user' },
    firstname: { type: String, maxlength: 50, required: true },
    middlename: { type: String, maxlength: 50 },
    lastname: { type: String, maxlength: 50, required: true },
    isallowedtodelete: { type: Boolean, default: true },
    isallowedtocreate: { type: Boolean, default: true },
    isallowedtoupdate: { type: Boolean, default: true },
    isblock: { type: Boolean, default: false }
}));

module.exports.getUser = async (req, callback) => {
    console.log(req.auth)
    const result = await User.aggregate([
        {
            $match: {
                _id: ObjectId(req.auth._id)
            }
        },
        {
            $project: {
                email: 1,
                role: 1,
                fullname: {
                    $concat: [
                        '$firstname', ' ',
                        '$lastname'
                    ]
                },
                isallowedtodelete: 1,
                isallowedtocreate: 1,
                isallowedtoupdate: 1,
                isblock: 1
            }
        }
    ]);

    callback({ success: true, data: result, code: 200 });
};

module.exports.getUsers = async (req, callback) => {
    const result = await User.aggregate([
        {
            $match: {
                role: 'user'
            }
        },
        {
            $project: {
                email: 1,
                role: 1,
                fullname: {
                    $concat: [
                        '$firstname', ' ',
                        '$lastname'
                    ]
                },
                isallowedtodelete: 1,
                isallowedtocreate: 1,
                isallowedtoupdate: 1,
                isblock: 1
            }
        }
    ]);

    callback({ success: true, data: result, code: 200 });
}

module.exports.authenticate = async (req, callback) => {
    const email = req.body.email;
    const password = req.body.password;
    const account = await User.aggregate([
        {
            $match: {
                email: email,
                password: password
            }
        },
        {
            $project: {
                email: 1,
                role: 1,
                fullname: {
                    $concat: [
                        '$firstname', ' ',
                        '$lastname'
                    ]
                },
                isblock: 1
            }
        }
    ]);

    callback(account);
}

module.exports.updateUserAccess = async (req, callback) => {
    console.log('booooooody', req.body)
    const id = req.body.editedSession._id;
    const result = await User.updateOne(
        { _id: id },
        {
            $set: {
                isallowedtodelete: req.body.editedSession.isallowedtodelete,
                isallowedtocreate: req.body.editedSession.isallowedtocreate,
                isallowedtoupdate: req.body.editedSession.isallowedtoupdate,
                isblock: req.body.editedSession.isblock
            }
        }
    )

    callback({ success: true, data: result, code: 201 });
}

module.exports.checkAccess = async (properties, callback) => {
    properties._id = ObjectId(properties._id);

    const accesschecker = { $match: properties }
    
    const result = await User.aggregate([
        accesschecker,
        {
            $project: {
                _id: 1
            }
        }
    ]);

    callback({ success: true, data: result.length});
}


