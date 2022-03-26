'use_strict';

const { response } = require('express');
const { resolve } = require('path');

const
    mongoose = require('mongoose'),
    config = require('./../config'),
    path = require('path'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    User = require(`./../model/user`).methods;



module.exports.execute = (query, options = {}) => async (req, res) => {
    this.security(req, res, options, async (response) => {
        if(response.success){
            req.auth = response.account;
            try {
                await query(req, (result) => res.status(result.code).send(result));     
            } catch (error) {
                this.errorHandler(error, req , (message) => res.status(200).send(message));
            }
        }
    });
};

module.exports.security = async (req, res, options, callback) => {
    let success = true;
    let account;
    try {
        if(!options.hasOwnProperty('secured')) options.secured = true;

        if(options.secured){
            const token = req.headers['authorization'];

            if(token){
                account = await jwt.verify(token, process.env.SECRET_KEY);

                if(options.hasOwnProperty('role') && options.role.length){
                    await this.verifyRole(account.role, options.role);
                } 

                await this.verifyAccess(account, options); 
            }
        } 
    } catch (error) {
        success = false;
        this.errorHandler(error, req , (message) => res.status(200).send(message));
    }

    callback({account, success})  
};

module.exports.verifyRole = (accountRole, allowedRoles) => {
    return new Promise((resolve, reject) => {
        if(!allowedRoles.includes(accountRole)) reject(new Error('Restricted'));
        resolve();
    })
};

module.exports.verifyAccess = (account, options) => {
    return new Promise(async (resolve, reject) => {
       if(!options.hasOwnProperty('strict') ) options.strict = {};
       
       options.strict._id = account._id;
       options.strict.isblock = false;
     
       const allowed = await User.checkAccess(options.strict);

       if(allowed) resolve();
       else reject(new Error('Restricted'));
    })
};

module.exports.getcurrentdate = () => {
    const date= new Date()
    return new Date(date.setHours(date.getHours() + 8));
};

module.exports.errorHandler = (error, req, callback) => {
    const message = {
        success: false, error: {
            type: error.name,
            message: error.message,
            __route: req.url,
            account: req.auth,
            date: this.getcurrentdate()
        }
    };

    switch(message.error.message){
        case 'query is not a function':
          message.error.message = "query function does not exist"
        break;
    }
    console.log(message)
    this.write(message)
    callback({message});
};

module.exports.write = (msg) => {
    fs.writeFileSync('./logbook/error.log', JSON.stringify(msg) + '\n', { flag: 'a' });
};

module.exports.init = {
    mongoose: () => {
        mongoose.connect(config.database, { "useUnifiedTopology": true, "useNewUrlParser": true }, () => {
            switch (mongoose.connection.readyState) {
                case 0:
                    console.log('\x1b[36m', `Unsuccessful Database Connection.`);
                    break;
                case 1:
                    console.log('\x1b[36m', `Successfully Connected to Database ${config.database}`);
                    break;
            }
        })
    }
};



