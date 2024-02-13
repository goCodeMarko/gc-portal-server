const padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  model = require(`./../models/${base}`),
  bookController = require(`./../controllers/book`),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  qrcode = require("./../services/qrcode"),
  barcode = require("./../services/barcode"),
  pdf = require("./../services/pdf"),
  excel = require("./../services/excel"),
  papaparse = require("./../services/papaparse"),
  stream = require("stream"),
  _ = require("lodash"),
  { userAccessDTO } = require("../services/dto"),
  email = require("./../services/email"),
  id_card = require("./../services/id_card"),
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

module.exports.getAuthUser = async (req, res) => {
  try {
    let response = { success: true, code: 200 };
    req.fnParams = {
      userId: req.auth?._id,
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
          // res.cookie("jwt_token", token, {
          //   httpOnly: true,
          //   maxAge: 86400000,
          // });

          response.data = { token, account: result[0] };
        }
      } else {
        //credentials does'nt exists
        response.success = false;
        response.code = 401;
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
    const sendEmail = await email.welcomeMsg(
      "patrickmarckdulaca@gmail.com",
      "email_template",
      {
        documentType: "Mayor's Permit",
      }
    );

    const response = { success: true, code: 200 };
    let user;
    console.log(1);
    req.fnParams = {
      userId: req.auth?._id,
    };
    console.log(2);
    await model.getUser(req, res, (result) => {
      if (_.isEmpty(result))
        throw new padayon.BadRequestException("No user found!");
      console.log(9999999, result);
      user = result;
    });
    console.log(3);
    const generatedQR = await qrcode.generate(user);
    console.log(3434534, generatedQR);
    if (
      _.isEmpty(generatedQR?.secure_url) ||
      _.isEmpty(generatedQR?.public_id) ||
      _.isEmpty(generatedQR?.format)
    )
      throw new padayon.BadRequestException("Invalid QR Code generation.");
    console.log(4);
    req.fnParams = {
      secure_url: generatedQR.secure_url,
      public_id: generatedQR.public_id,
      format: generatedQR.format,
      _id: req.auth?._id,
    };
    console.log(5);
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
    console.log(6);
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::generateQR", error, req, res);
  }
}; //---------done

module.exports.generateIdCard = async (req, res) => {
  try {
    const response = { success: true, code: 200 };
    let user;
    console.log(1);
    req.fnParams = {
      userId: req.auth?._id,
    };
    console.log(2);
    await model.getUser(req, res, (result) => {
      if (_.isEmpty(result))
        throw new padayon.BadRequestException("No user found!");
      user = result;
    });
    console.log(3);
    const generatedIdCard = await id_card.generate(user);
    console.log(4);
    if (
      _.isEmpty(generatedIdCard.front_card?.secure_url) ||
      _.isEmpty(generatedIdCard.front_card?.public_id) ||
      _.isEmpty(generatedIdCard.front_card?.format) ||
      _.isEmpty(generatedIdCard.back_card?.secure_url) ||
      _.isEmpty(generatedIdCard.back_card?.public_id) ||
      _.isEmpty(generatedIdCard.back_card?.format)
    )
      throw new padayon.BadRequestException("Invalid ID Card generation.");
    console.log(5);
    req.fnParams = {
      front_card: {
        secure_url: generatedIdCard.front_card?.secure_url,
        public_id: generatedIdCard.front_card?.public_id,
        format: generatedIdCard.front_card?.format,
      },
      back_card: {
        secure_url: generatedIdCard.back_card?.secure_url,
        public_id: generatedIdCard.back_card?.public_id,
        format: generatedIdCard.back_card?.format,
      },
      _id: req.auth?._id,
    };
    console.log(6);
    await model.generateIdCard(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.nModified, 1)) {
        throw new padayon.BadRequestException(
          "The updated ID Card is not reflected in user's acccount. Please try again."
        );
      }

      response.data = {
        front_card: {
          secure_url: generatedIdCard.front_card?.secure_url,
          public_id: generatedIdCard.front_card?.public_id,
          format: generatedIdCard.front_card?.format,
        },
        back_card: {
          secure_url: generatedIdCard.back_card?.secure_url,
          public_id: generatedIdCard.back_card?.public_id,
          format: generatedIdCard.back_card?.format,
        },
      };
    });
    return response;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::generateIdCard", error, req, res);
  }
}; //---------done

module.exports.generateBarcode = async (req, res) => {
  try {
    const response = { success: true, code: 200 };
    const generatedBarcode = await barcode.generate(req.auth._id);
    console.log(23423423, generatedBarcode);
    if (
      _.isEmpty(generatedBarcode?.secure_url) ||
      _.isEmpty(generatedBarcode?.public_id) ||
      _.isEmpty(generatedBarcode?.format) ||
      _.isEmpty(generatedBarcode?.text_output)
    )
      throw new padayon.BadRequestException("Invalid Barcode generation.");

    req.fnParams = {
      secure_url: generatedBarcode.secure_url,
      public_id: generatedBarcode.public_id,
      format: generatedBarcode.format,
      text_output: generatedBarcode.text_output,
      _id: req.auth?._id,
    };

    await model.generateBarcode(req, res, (result) => {
      if (_.isEmpty(result) || !_.isEqual(result.nModified, 1))
        throw new padayon.BadRequestException(
          "The updated Barcode is not reflected in user's acccount. Please try again."
        );

      response.data = {
        url: generatedBarcode.secure_url,
        bytes: generatedBarcode.bytes,
        format: generatedBarcode.format,
        text_output: generatedBarcode.text_output,
      };
    });
    return response;
  } catch (error) {
    console.log(2222222, error);
    padayon.ErrorHandler("Controller::User::generateBarcode", error, req, res);
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
    console.log("---------------------------999999");
    let response = { success: true, code: 200 };
    // const public_id = req.query.public_id;
    // const qrcodeURL = await fetchFile(public_id, {
    //   sign_url: true,
    //   type: "authenticated",
    //   transformation: {
    //     radius: 10,
    //   },
    // });
    const books = await bookController.getBooks(req, res);

    const filename = padayon.uniqueId({ fileExt: "pdf" });

    res.writeHead(200, {
      "Content-Type": "application/pdf", // Set the appropriate content type
      "Content-Disposition": `attachment; filename=${filename}`, // Change the filename as needed
    });
    const user = await this.getAuthUser(req, res);

    const pdfReadStream = await pdf.generate("unknown_report", {
      name: user.data?.firstname + " " + user.data?.lastname,
      th: ["AUTHOR", "STOCKS", "TITLE", "PRICE"],
      td: books?.data?.items,
      qrcode: user.data?.qrcode?.url,
    });

    pdfReadStream.on("data", (chunk) => {
      res.write(chunk);
    });

    pdfReadStream.on("error", (err) => {
      throw new Error("Failed during PDF file download");
    });

    pdfReadStream.on("close", () => {
      res.end();
    });
  } catch (error) {
    padayon.ErrorHandler("Controller::User::downloadPDF", error, req, res);
  }
}; //---------done
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

    if (_.size(books.data?.items) === 0)
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
        data: books.data.items,
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

    // const response = await axios.get(cloud, {
    //   responseType: "arraybuffer",
    // });
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
