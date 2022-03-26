'use_strict';


const
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    mongoose = require('mongoose'),
    { ObjectId } = require('mongodb'),
    jwt = require('jsonwebtoken');

    User = mongoose.model(base, mongoose.Schema({
        email: { type: String, maxlength: 50, required: true },
        password: { type: String, maxlength: 50 },
        role: { type: String, maxlength:20, default: 'user'},
        firstname: { type: String, maxlength: 50, required: true },
        middlename: { type: String, maxlength: 50 },
        lastname: { type: String, maxlength: 50, required: true },
        isallowedtodelete: { type: Boolean, default: true},
        isallowedtocreate: { type: Boolean, default: true},
        isallowedtoupdate: { type: Boolean, default: true},
        isblock: { type: Boolean, default: false}
    }));

module.exports.methods = {

    userInfo: async (req, callback) => {
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
    },

    allUsers: async (req, callback) => {
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
    },

    authenticate: async (req, callback) => {
        console.log(req)
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
        
        if(account.length){
            if(account[0].isblock){
                callback({ success: false, data: [], code: 200, message: 'Your account has been block'});
            }else {
                const token = jwt.sign(account[0], process.env.SECRET_KEY);

                callback({ success: true, data: { token, account: account[0] }, code: 200 });
            }
        }else{
            callback({ success: false, data: [], code: 200, message: 'Username or Password is incorrect'});
        }
    },

    editUserAccess: async (req, callback) => {
        console.log('booooooody', req.body)
        const id = req.body.editedSession._id;
        const result = await User.updateOne(
                { _id : id },
                { 
                    $set: { 
                        isallowedtodelete: req.body.editedSession.isallowedtodelete,
                        isallowedtocreate: req.body.editedSession.isallowedtocreate,
                        isallowedtoupdate: req.body.editedSession.isallowedtoupdate,
                        isblock: req.body.editedSession.isblock
                    } 
                }
             )

        callback({ success: true, data: result, code: 201});
    },

    checkAccess: async (properties) => {
        properties._id = ObjectId(properties._id);

        const accesschecker = { $match: properties}
   console.log('prrrrrrroooooop', accesschecker)
        const result = await User.aggregate([
            accesschecker,
            {
                $project: {
                    _id : 1
                }
            }
        ]);

       return result.length;
    }
};


