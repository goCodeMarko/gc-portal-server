'use_strict';


const
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb');
let $global = { queryResult: null };

User = mongoose.model(base, mongoose.Schema({
    email:              { type: String, maxlength: 50, required: true },
    password:           { type: String, maxlength: 50 },
    role:               { type: String, maxlength: 20, default: 'user' },
    firstname:          { type: String, maxlength: 50, required: true },
    middlename:         { type: String, maxlength: 50 },
    lastname:           { type: String, maxlength: 50, required: true },
    isallowedtodelete:  { type: Boolean, default: true },
    isallowedtocreate:  { type: Boolean, default: true },
    isallowedtoupdate:  { type: Boolean, default: true },
    isblock:            { type: Boolean, default: false }
}));


module.exports.getUser = async (req, res, callback) => {
    try {
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

        $global.queryResult = result;
    } catch (error) {
        padayon.errorHandler('Model::User::getUser', error, req, res)
    } finally {
        callback($global.queryResult);
    }
};

module.exports.getUsers = async (req, res, callback) => {
    try {
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

        $global.queryResult = result;
    } catch (error) {
        padayon.errorHandler('Model::User::getUsers', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}

module.exports.authenticate = async (req, res, callback) => {
    try {
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

        $global.queryResult = account;
    } catch (error) {
        padayon.errorHandler('Model::User::authenticate', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}

module.exports.updateUserAccess = async (req, res, callback) => {
    try {
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

        $global.queryResult = result;
    } catch (error) {
        padayon.errorHandler('Model::User::updateUserAccess', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}

module.exports.checkAccess = async (properties, req, res, callback) => {
    try {
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
        console.log('accesschecker',accesschecker)
        $global.queryResult = result;
    } catch (error) {
        padayon.errorHandler('Model::User::checkAccess', error, req, res)
    } finally {
        callback($global.queryResult);
    }
}


