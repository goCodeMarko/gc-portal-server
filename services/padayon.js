"use_strict";

const mongoose = require("mongoose"),
  config = require("../config"),
  path = require("path"),
  fs = require("fs"),
  jwt = require("jsonwebtoken"),
  moment = require("moment"),
  userController = require(`../controllers/user`),
  _ = require("lodash"),
  cron = require("./../services/cron"),
  { v4: uuidv4 } = require("uuid");

module.exports.execute =
  (controller, options = {}) =>
  async (req, res) => {
    this.security(req, res, options, async (response) => {
      if (response.success) {
        req.auth = response.account;
        try {
          let data = await controller(req, res);

          const code = data?.code ?? 200;
          const message = data ?? {};

          res.status(code).send(message);
        } catch (error) {}
      }
    });
  }; //---------done

module.exports.getcurrentdate = () => {
  const date = new Date();
  return new Date(date.setHours(date.getHours() + 8));
};

module.exports.write = (msg) => {
  fs.writeFileSync("./logbook/error.log", JSON.stringify(msg) + "\n", {
    flag: "a",
  });
};

module.exports.ErrorHandler2 = (area, error) => {
  const message = {
    success: false,
    error: {
      area,
      message: error.message,
      type: error.name,
      __route: req.url,
      date,
    },
  };
  res.status(statusCode).send(message);
};

module.exports.ErrorHandler = (area, error, req, res) => {
  const date = moment().format("MM-DD-YYYY hh:mm A");
  const statusCode = error.statusCode || 500;
  const message = {
    success: false,
    error: {
      area,
      message: error.message,
      type: error.name,
      __route: req.url,
      date,
    },
  };
  this.write(message);
  res.status(statusCode).send(message);
}; //---------done

module.exports.security = async (req, res, options, callback) => {
  let response = { success: true, message: "", account: {} };
  try {
    if (!_.has(options, "secured")) options.secured = true;
    console.log(2222222222222);
    if (options.secured) {
      const raw = _.split(req.headers["authorization"], " ");
      const jwt_token = raw[1];
      console.log(_.split(req.headers["authorization"], " "));
      // const { jwt_token } = req.cookies;
      console.log(2342323, jwt_token);
      if (!_.isEmpty(jwt_token)) {
        let account = jwt.verify(jwt_token, process.env.JWT_PRIVATE_KEY);

        response.account = account;

        if (_.has(options, "role") && !_.isEmpty(options.role)) {
          await this.verifyRole(account.role, options.role);
        }

        const access = await this.verifyAccessControl(
          account,
          options,
          req,
          res
        );

        if (!access)
          throw new this.ForbiddenException(
            "You do not have privilege to perform this action."
          );
        return;
      } else {
        throw new this.UnauthorizedException("No token found.");
      }
    }
  } catch (error) {
    response.success = false;
    response.code = error.statusCode;
    this.ErrorHandler("Padayon::Utils::security", error, req, res);
  } finally {
    callback(response);
  }
}; //---------done

module.exports.verifyRole = (accountRole, allowedRoles) => {
  return new Promise((resolve, reject) => {
    if (!allowedRoles.includes(accountRole))
      reject(new Error("Error in verifyRole"));

    resolve();
  });
}; //---------done

module.exports.verifyAccessControl = (account, options, req, res) => {
  return new Promise(async (resolve, reject) => {
    if (!_.has(options, "strict")) options.strict = {};

    req.fnParams = {
      accessControls: {
        ...options.strict,
        isblock: false,
      },
      _id: account._id,
    };

    let result = await userController.verifyAccessControl(req, res);

    if (result.success) resolve(true);
    else resolve(false);
  });
}; //---------done

module.exports.requestLogger = (req, res, next) => {
  const date = moment().format("MM-DD-YYYY HH:MM:SS");
  const message = `${date}\t ${req.method}\t ${req.headers.origin}\t ${req.url}\t ${req.headers["user-agent"]}`;
  // fs.writeFileSync('./logbook/requests.log', message + '\n', { flag: 'a' });
  next();
};

module.exports.uniqueId = (options = {}) => {
  const fileFormats = [
    "pdf",
    "jpeg",
    "jpg",
    "png",
    "docx",
    "xls",
    "xlsx",
    "txt",
  ];
  let uniqueId = uuidv4();

  if (_.has(options, "fileExt") && !_.isEmpty(options.fileExt)) {
    if (!fileFormats.includes(options.fileExt))
      throw new Error("File extension not supported.");

    uniqueId += `.${options.fileExt}`;
  }
  return uniqueId;
}; //---------done

module.exports.Init = {
  Mongoose: () => {
    mongoose.connect(
      config.database,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      },
      () => {
        switch (mongoose.connection.readyState) {
          case 0:
            console.log("\x1b[36m", `Unsuccessful Database Connection.`);
            break;
          case 1:
            console.log(
              "\x1b[36m",
              `Successfully Connected to Database ${config.database}`
            );
            break;
        }
      }
    );
  }, //---------done

  CronJobs: () => {
    cron.run();
    console.log("\x1b[36m", `Cronjob(s) Activated...`);
  }, //---------done
};

module.exports.BadRequestException = class BadRequestException extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "BadRequestException";
  }
}; //---------done

module.exports.UnauthorizedException = class UnauthorizedException extends (
  Error
) {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = "UnauthorizedException";
  }
}; //---------done

module.exports.ForbiddenException = class ForbiddenException extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
    this.name = "ForbiddenException";
  }
}; //---------done
