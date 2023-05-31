'use_strict';

const
    mongoose = require('mongoose'),
    config = require('../config'),
    path = require('path'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    userController = require(`../controllers/user`),
    { v4: uuidv4 } = require('uuid');
    cron = require('node-cron');


module.exports.execute = (controller, options = {}) => async (req, res) => {
    this.security(req, res, options, async (response) => {
        if(response.success){
            req.auth = response.account;
            try {
                let data = await controller(req, res);
                res.status(data.code).send(data);
            } catch (error) {
            }    
        } else {
            res.status(200).send({ success: false, message: response.message });
        }
    });
};

module.exports.getcurrentdate = () => {
    const date = new Date()
    return new Date(date.setHours(date.getHours() + 8));
};


module.exports.write = (msg) => {
    fs.writeFileSync('./logbook/error.log', JSON.stringify(msg) + '\n', { flag: 'a' });
};

module.exports.errorHandler = (area, error, req, res) => {
    const date = moment().format('MM-DD-YYYY hh:mm A');
    const message = {
        success: false, error: {
            area,
            message: error.message,
            type: error.name,
            __route: req.url,
            // account: req.auth,
            date
        }
    };

    console.error(message)
    this.write(message)
    res.status(500).send(message)
};

module.exports.security = async (req, res, options, callback) => {
    console.log(res.cookie)
    let response = { success: true, message: '', account: {} };
    try {
        if(!options.hasOwnProperty('secured')) options.secured = true;
        console.log('options.secured', options.secured)
        if(options.secured){
            const token = req.headers['authorization'];

            if(token){
                let account = await jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                response.account = account;

                if(options.hasOwnProperty('role') && options.role.length){
                    await this.verifyRole(account.role, options.role);
                } 

                const access = await this.verifyAccess(account, options ,req, res); 

                if (!access) {
                    response.success = false;
                    response.message = 'Restricted';
                }
            }else{
                res.status(401).send({success: false, message: 'Missing token'});
                return;
            }
        } 
    } catch (error) {
        success = false;
        
        this.errorHandler('Padayon::Utils::security', error, req ,res);
    }
 
    callback(response)  
};

module.exports.verifyRole = (accountRole, allowedRoles) => {
    return new Promise((resolve, reject) => {
        if (!allowedRoles.includes(accountRole)) reject(new Error('Error in verifyRole'));

        resolve();
    })
};

module.exports.verifyAccess = (account, options ,req ,res) =>  {
    return new Promise(async (resolve, reject) => {
       if(!options.hasOwnProperty('strict') ) options.strict = {};
       
       options.strict._id = account._id;
       options.strict.isblock = false;
        
       let result = await userController.checkAccess(options.strict, req, res);
        
        if (result.success) resolve(true);
        else resolve(false);
    })
};


module.exports.requestLogger = (req, res, next) => {
    const date = moment().format("MM-DD-YYYY HH:MM:SS");
    const message = `${date}\t ${req.method}\t ${req.headers.origin}\t ${req.url}\t ${req.headers['user-agent']}`;
    // fs.writeFileSync('./logbook/requests.log', message + '\n', { flag: 'a' });
    next();
};

module.exports.uniqueId = (option) => {
    const supportedExtension = ['pdf', 'jpeg', 'jpg', 'png', 'docx', 'xls', 'xlsx', 'txt'];
    let uniqueId = '';
    
    if (option.hasOwnProperty('fileExtension') && option.fileExtension.length){
         uniqueId += uuidv4();
        if (supportedExtension.includes(option.fileExtension)){
            uniqueId += '.' + option.fileExtension;
        }else {
            throw new Error('File extension not supported.');
        }
    }
    
    return uniqueId;
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
