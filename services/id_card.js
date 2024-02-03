const padayon = require("../services/padayon"),
  { createCanvas, loadImage } = require("canvas"),
  QRCode = require("qrcode"),
  moment = require("moment"),
  momentTz = require("moment-timezone"),
  _ = require("lodash"),
  cloudinary = require("./../services/cloudinary");

module.exports.generate = async (user) => {
  console.log(4);
  console.log(443, user.profile_picture);
  console.log(777, user.profile_picture?.publicId);
  if (_.isEmpty(user.barcode?.publicId)) {
    throw new padayon.BadRequestException("There's no barcode found.");
  }

  if (_.isEmpty(user.profile_picture?.publicId)) {
    throw new padayon.BadRequestException("There's no profile picture found.");
  }
  console.log(5);
  const frontCardbase64 = await createFrontCardImg(user);
  console.log(6);
  const backCardbase64 = await createBackCardImg(user);
  console.log(7);
  const uploads = await uploadIdCards(frontCardbase64, backCardbase64);

  console.log(11111111111111, uploads);
  return uploads;
};

async function uploadIdCards(frontCardbase64, backCardbase64) {
  const uploadFrontCard = await cloudinary.uploader.upload(frontCardbase64, {
    folder: "id_cards",
  });
  const uploadBackCard = await cloudinary.uploader.upload(backCardbase64, {
    folder: "id_cards",
  });

  return { front_card: uploadFrontCard, back_card: uploadBackCard };
}

async function createFrontCardImg(user) {
  console.log(1111, user);

  const w_card_template = 1011,
    h_card_template = 639,
    template_url =
      "https://res.cloudinary.com/dhmkfau4h/image/upload/v1706845102/logo/Schwaiger_e7nbad.png",
    x_card_template = 0,
    y_card_template = 0;

  //create canvas for qr
  const front_card_canvas = createCanvas(w_card_template, h_card_template); // 164
  const front_card_context = front_card_canvas.getContext("2d");

  //styling the logo canvas
  const logo_image = await loadImage(template_url);

  //inserts the logo on qrcode canvas
  front_card_context.drawImage(
    logo_image,
    x_card_template,
    y_card_template,
    w_card_template,
    h_card_template
  );

  //profile picture
  const profile_picture = cloudinary.url(user.profile_picture.publicId, {
    radius: "max",
    border: "50px_solid_white",
  });
  const user_photo = await loadImage(profile_picture);
  front_card_context.drawImage(user_photo, 100, 120, 350, 350);

  // surname
  front_card_context.font = "900 60px Arial";
  front_card_context.fillStyle = "#417271";
  front_card_context.fillText(user.lastname + ",", 500, 200);

  //first name
  front_card_context.font = "900 60px Arial";
  front_card_context.fillStyle = "#000000";
  front_card_context.fillText(user.firstname, 500, 250);

  const base64 = front_card_canvas.toDataURL("image/png");

  return base64;
}

async function createBackCardImg(user) {
  const w_card_template = 1011,
    h_card_template = 639,
    template_url =
      "https://res.cloudinary.com/dhmkfau4h/image/upload/v1706846705/logo/Schwaiger_back_okjags.png",
    x_card_template = 0,
    y_card_template = 0;

  //create canvas for qr
  const front_card_canvas = createCanvas(w_card_template, h_card_template); // 164
  const front_card_context = front_card_canvas.getContext("2d");

  //styling the logo canvas
  const logo_image = await loadImage(template_url);

  //inserts the logo on qrcode canvas
  front_card_context.drawImage(
    logo_image,
    x_card_template,
    y_card_template,
    w_card_template,
    h_card_template
  );

  //barcode
  const barcode = cloudinary.url(user.barcode.publicId, {});
  const barcode_img = await loadImage(barcode);
  front_card_context.drawImage(barcode_img, 180, 415, 650, 222);

  const base64 = front_card_canvas.toDataURL("image/png");

  return base64;
}
