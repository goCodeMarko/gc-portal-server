const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  model = require(`./../models/${base}`),
  bookController = require(`./../controllers/book`),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  qrcode = require("./../services/qrcode"),
  pdf = require("./../services/pdf"),
  excel = require("./../services/excel"),
  papaparse = require("./../services/papaparse"),
  stream = require("stream"),
  _ = require("lodash"),
  { userAccessDTO } = require("../services/dto"),
  cloudinary = require("./../services/cloudinary");

module.exports.getUser = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    req.fnParams = {
      userId: req.params?.id,
    };

    await model.getUser(req, res, (result) => {
      response.data = result ?? {};
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::getUser", error, req, res);
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    await model.getUsers(req, res, (result) => {
      response.data = result;
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::getUsers", error, req, res);
  }
};

module.exports.authenticate = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    await model.authenticate(req, res, (result) => {
      //checks if credentials exists
      if (_.size(result)) {
        //checks if user account is blocked
        if (result[0].isblock) {
          response.success = false;
          throw new padayon.ForbiddenException("Your account has been block");
        } else {
          //if not blocked then generate token
          const token = jwt.sign(result[0], process.env.JWT_PRIVATE_KEY, {
            expiresIn: "1d",
          });

          // set token as cookie
          res.cookie("jwt_token", token, {
            httpOnly: true,
            maxAge: 86400000,
          });
          response.success = true;
          response.message = "";

          response.data = { token, account: result[0] };
        }
      } else {
        //credentials does'nt exists
        response.success = false;
        throw new padayon.UnauthorizedException("Invalid Credentials");
      }
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::authenticate", error, req, res);
  }
}; //---------done

module.exports.updateUserAccess = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const body = {
      isallowedtodelete: req?.body?.isallowedtodelete,
      isallowedtocreate: req?.body?.isallowedtocreate,
      isallowedtoupdate: req?.body?.isallowedtoupdate,
      isblock: req?.body?.isblock,
    };

    await userAccessDTO.validateAsync(body);

    req.fnParams = {
      userId: req.params?.id,
      isallowedtodelete: body.isallowedtodelete,
      isallowedtocreate: body.isallowedtocreate,
      isallowedtoupdate: body.isallowedtoupdate,
      isblock: body.isblock,
    };

    await model.updateUserAccess(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.n, 1))
        throw new padayon.BadRequestException("User not found.");

      response.data = result ?? {};
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::updateUserAccess", error, req, res);
  }
}; //---------done

module.exports.verifyAccessControl = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    await model.verifyAccessControl(req, res, (result) => {
      response.success = !_.isEmpty(result) ? true : false;
      response.data = result;
    });

    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::User::verifyAccessControl",
      error,
      req,
      res
    );
  }
}; //---------done

module.exports.saveFile = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_pictures",
      type: "authenticated",
      resource_type: "auto",
      // allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
    });

    response.data = upload;
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::saveFile", error, req, res);
  }
};

module.exports.saveMultipleFiles = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const uploads = [];
    for (const file of req.files) {
      const { path } = file;

      const upload = await cloudinary.uploader.upload(path, {
        folder: "profile_pictures",
        type: "authenticated",
        resource_type: "auto",
        // allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'xls', 'xlsx']
      });

      uploads.push(upload);
    }

    response.data = uploads;
    return response;
  } catch (error) {
    padayon.ErrorHandler(
      "Controller::User::saveMultipleFiles",
      error,
      req,
      res
    );
  }
};

module.exports.generateQR = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    let generatedQR = await qrcode.generate();

    if (
      _.isEmpty(generatedQR?.secure_url) ||
      _.isEmpty(generatedQR?.public_id) ||
      _.isEmpty(generatedQR?.format)
    )
      throw new padayon.BadRequestException("Invalid QR Code generation.");

    req.fnParams = {
      secure_url: generatedQR.secure_url,
      public_id: generatedQR.public_id,
      format: generatedQR.format,
      _id: req.auth?._id,
    };

    await model.generateQR(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.nModified, 1))
        throw new padayon.BadRequestException(
          "The updated QR Code is not reflected in user's acccount. Please try again."
        );

      response.data = {
        url: generatedQR.secure_url,
        bytes: generatedQR.bytes,
        format: generatedQR.format,
      };
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::generateQR", error, req, res);
  }
}; //---------done

/*
module.exports.getFile = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const public_id = req.query.public_id;

    const url = await fetchFile(public_id, {
      sign_url: true,
      type: "authenticated",
      transformation: {
        radius: 10,
      },
    });

    response.data = url;
  return response;
  } catch (error) {

    padayon.ErrorHandler("Controller::User::getFile", error, req, res);
  } 
};
*/

module.exports.downloadPDF = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    // const public_id = req.query.public_id;
    // const qrcodeURL = await fetchFile(public_id, {
    //   sign_url: true,
    //   type: "authenticated",
    //   transformation: {
    //     radius: 10,
    //   },
    // });

    let books = await bookController.getBooks(req, res);

    const filename = padayon.uniqueId({ fileExt: "pdf" });

    const writeStream = res.writeHead(200, {
      "Content-Type": "application/pdf", // Set the appropriate content type
      "Content-Disposition": `attachment; filename=${filename}`, // Change the filename as needed
    });

    const pdfReadStream = await pdf.generate("unknown_report", {
      name: "Patric Marck Dulaca",
      th: ["AUTHOR", "STOCKS", "TITLE", "PRICE"],
      td: books.data.data,
      qrcode:
        "https://res.cloudinary.com/dhmkfau4h/image/upload/v1699527474/qr_codes/gyopmlrwkmoqcam2jxao.png",
    });

    pdfReadStream.on("data", (chunk) => {
      writeStream.write(chunk);
    });

    pdfReadStream.on("close", () => {
      res.end();
    });
  } catch (error) {
    padayon.ErrorHandler("Controller::User::downloadPDF", error, req, res);
  }
};
async function fetchFile(public_id, options) {
  const file = await cloudinary.image(public_id, options);
  const start = file.indexOf("'") + 1;
  const end = file.lastIndexOf("'");
  const url = file.slice(start, end);

  return url;
}

module.exports.downloadExcel = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const books = await bookController.getBooks(req, res);

    if (_.size(books.data?.data) === 0)
      throw new padayon.BadRequestException("There were no books found.");

    const buffer = await excel.generate({
      sheetName: "Sheet#1",
      header: {
        start: "A1",
        title: "Unknown Report",
      },
      table: {
        start: "A4",
        fields: ["AUTHOR", "STOCKS", "TITLE", "PRICE"],
        data: books.data.data,
        dataKeys: ["author", "stocks", "title", "price"],
      },
    });

    const filename = padayon.uniqueId({ fileExt: "xlsx" });

    res.writeHead(200, {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${filename}`,
    });
    const readStream = new stream.PassThrough();
    readStream.end(buffer);
    readStream.pipe(res);
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::downloadExcel", error, req, res);
  }
};

// module.exports.downloadCSV = async (req, res) => {
//   try {
//     let response = { success: true, code: 200 };
//     let books = await bookController.getBooks(req, res);
//     papaparse.generate();
//     return response;
//   } catch (error) {
//
//     padayon.ErrorHandler("Controller::User::downloadCSV", error, req, res);
//   }
// };

/*
module.exports.fileDownload = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    const axios = require("axios");
    let imageBuffer;

    const cloud = await cloudinary.api.resource(
      "qr_codes/f4ixvmwg2psvm01zlay7",
      { resource_type: "image", type: "authenticated" }
    );

    console.log("---------123", cloud);
    // const response = await axios.get(cloud, {
    //   responseType: "arraybuffer",
    // });
    // console.log("---------2", response.data);
    // if (response.status === 200) {
    //   imageBuffer = Buffer.from(response.data, "binary");
    // } else {
    //   // throw new Error('Failed to fetch the image');
    // }

    const filename = padayon.uniqueId({ fileExtension: "png" });
    // Public ID of the file you want to download
    const publicId = "your_public_id";

    // Generate the URL for the file

    res.writeHead(200, {
      "Content-Type": "image/png", // Set the appropriate content type
      "Content-Disposition": `attachment; filename=${filename}`, // Change the filename as needed
    });

    // Create a Readable stream from the buffer
    const readStream = new stream.PassThrough();
    readStream.end(imageBuffer);

    //"https://res.cloudinary.com/dhmkfau4h/image/authenticated/s--uqZ_PCNA--/v1699431709/qr_codes/llj5iehodncxewjh12pr.png"

    readStream.pipe(res);
  return response;
  } catch (error) {

    padayon.ErrorHandler("Controller::User::downloadExcel", error, req, res);
  } 
};
*/
