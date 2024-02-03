const { createCanvas, loadImage } = require("canvas"),
  QRCode = require("qrcode"),
  moment = require("moment"),
  momentTz = require("moment-timezone"),
  cloudinary = require("./../services/cloudinary"),
  _ = require("lodash");

module.exports.generate = async (user) => {
  const datetime = moment().locale("tl-ph").format("MDYYHHmmssSSS");
  console.log(453, user);
  const user_creation_timestamp = _.toUpper(user._id.toString().slice(0, 8));
  const text_output = `Q${datetime}${user_creation_timestamp}`;

  const result = uploadQRCode(text_output, user);

  return result;
};

async function uploadQRCode(text_output, user) {
  const qrCodeBase64 = await createQRCodeImg(text_output, user);

  // uploads the qr code image on the cloudinary
  const upload = await cloudinary.uploader.upload(qrCodeBase64, {
    folder: "qr_codes",
  });
  return upload;
}

async function createQRCodeImg(text_output) {
  const w_qrcode = 800,
    h_qrcode = 800,
    logo_url =
      "https://res.cloudinary.com/dhmkfau4h/image/upload/v1706758355/logo/icons8-user-male-300_1_uhqivq.png",
    x_logo = 245,
    y_logo = 245,
    w_logo = 300,
    h_logo = 300;

  //create canvas for qr
  const qrCodecanvas = createCanvas(w_qrcode, h_qrcode); // 164
  const qrCodeContext = qrCodecanvas.getContext("2d");

  //insert qrcode image on the qr canvas
  QRCode.toCanvas(qrCodecanvas, text_output, {
    errorCorrectionLevel: "H",
    version: 4,
    type: "image/png",
    quality: 1,
    maskPattern: 7,
    margin: 3,
    scale: 8,
    width: w_qrcode,
    color: {
      dark: "#000",
      light: "#ffffff",
    },
  });

  //styling the logo canvas
  const logo_image = await loadImage(logo_url);

  /*
  const logoCanvas = createCanvas(500, 500);
  const logoContext = logoCanvas.getContext("2d");
  logoContext.alpha = true;
  logoContext.fillStyle = "rgba(255, 255, 255, 0.8)";
  logoContext.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
  logoContext.drawImage(logo, 6, 6, 490, 490);
  */

  //inserts the logo on qrcode canvas
  qrCodeContext.drawImage(logo_image, x_logo, y_logo, w_logo, h_logo);

  const base64 = qrCodecanvas.toDataURL("image/png");

  return base64;
}
