const { createCanvas, loadImage } = require("canvas"),
  moment = require("moment"),
  cloudinary = require("./../services/cloudinary").uploader,
  JsBarcode = require("jsbarcode"),
  _ = require("lodash");

module.exports.generate = async (user_id) => {
  const datetime = moment().locale("tl-ph").format("MDYYHHmmssSSS");
  const user_creation_timestamp = _.toUpper(user_id.slice(0, 8));
  const text_output = `B${datetime}${user_creation_timestamp}`;

  const result = await uploadBarcode(text_output);

  return { ...result, text_output };
};

async function uploadBarcode(text_output) {
  const barcodeBase64 = await createBarcodeImg(text_output);

  //uploads the qr code image on the cloudinary
  const upload = await cloudinary.upload(barcodeBase64, {
    folder: "barcodes",
    // type: "authenticated",
  });

  return upload;
}

async function createBarcodeImg(text_output) {
  const canvas = createCanvas();
  try {
    JsBarcode(canvas, text_output, {
      format: "CODE128",
    });
  } catch (error) {
    throw new Error(error);
  }
  const base64 = canvas.toDataURL("image/png");

  return base64;
}
