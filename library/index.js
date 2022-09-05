'use_strict';

const
    mongoose = require('mongoose'),
    config = require('./../config'),
    path = require('path'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    userController = require(`../controllers/user`),
    cron = require('node-cron');

module.exports.execute = (controller, options = {}) => async (req, res) => {
    this.security(req, res, options, async (response) => {
        if(response.success){
            req.auth = response.account;
            try {
                await controller(req, res, (result) => res.status(result.code).send(result));     
            } 
            catch (error) {
                this.errorHandler(error, req , (message) => res.status(500).send(message));
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
                account = await jwt.verify(token, process.env.JWT_SECRET_KEY);

                if(options.hasOwnProperty('role') && options.role.length){
                    await this.verifyRole(account.role, options.role);
                } 

                await this.verifyAccess(account, options); 
            }else{
                res.status(401).send({success: false, message: 'Missing token'});
                return;
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
        if(!allowedRoles.includes(accountRole)) reject(new Error('Restricted (role)'));
        console.log(1);
        resolve();
    })
};

module.exports.verifyAccess = (account, options) => {
    return new Promise(async (resolve, reject) => {
       if(!options.hasOwnProperty('strict') ) options.strict = {};
       
       options.strict._id = account._id;
       options.strict.isblock = false;
     
       userController.checkAccess(options.strict, (isAllowed) =>{
           if (isAllowed) resolve();
           else reject(new Error('Restricted (access)'));
       });
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

module.exports.requestLogger = (req, res, next) => {
    const date = moment().format("MM-DD-YYYY HH:MM:SS");
    const message = `${date}\t ${req.method}\t ${req.headers.origin}\t ${req.url}\t ${req.headers['user-agent']}`;
    fs.writeFileSync('./logbook/requests.log', message + '\n', { flag: 'a' });
    next();
};

module.exports.init = {
    mongoose: () => {
        mongoose.connect(config.database, { 
            "useUnifiedTopology": true, 
            "useNewUrlParser": true 
        }, () => {
            switch (mongoose.connection.readyState) {
                case 0:
                    console.log('\x1b[36m', `Unsuccessful Database Connection.`);
                    break;
                case 1:
                    console.log('\x1b[36m', `Successfully Connected to Database ${config.database}`);
                    break;
            }
        })
    },

    cron: () => {
        cron.schedule('17 19 * * *', () => {
            console.log('running a task every 17 19');
        }, {
            timezone: "Asia/Manila"
        });

        cron.schedule('* * * * *', () => {
            console.log('running a task every minute');
        }, {
            timezone: "Asia/Manila"
        });

        console.log('\x1b[36m', `Cronjob(s) Activated...`);
    }
};



