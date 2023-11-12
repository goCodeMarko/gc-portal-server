const padayon = require("./padayon"),
  cloudinary = require("./../services/cloudinary"),
  moment = require("moment"),
  fsPromises = require("fs/promises"),
  path = require("path"),
  puppeteer = require("puppeteer"),
  hbs = require("handlebars");

module.exports.generate = async (template, data) => {
  console.log(1);
  const browser = await puppeteer.launch({ headless: "new" });
  console.log(2);
  const page = await browser.newPage();
  console.log(3);
  // const filename = padayon.uniqueId({ fileExtension: "pdf" });
  const html = await compile(template, data);
  console.log(4);
  await page.setContent(html);
  console.log(5);
  const pdfReadStream = await page.createPDFStream({
    format: "Legal",
    orientation: "portrait",
  });
  console.log(6);
  pdfReadStream.on("close", async () => {
    await browser.close();
  });
  console.log(7);
  return pdfReadStream;
  // const cloud = await cloudinary.uploader.upload(buffer, {
  //   folder: "random",
  //   type: "authenticated",
  // });
  // cloudinary.uploader
  //   .upload_stream(
  //     {
  //       folder: "random",
  //       resource_type: "auto",
  //       type: "authenticated",
  //     },
  //     (error, result) => {
  //       console.log("yowwww1");
  //     }
  //   )
  //   .end(buffer)

  // await fsPromises.unlink(path.join(process.cwd(), "xfiles", filename));

  // const details = {
  //   created_at: moment().format("MM-DD-YYYY_hh-mm-ss"),
  //   publicId: cloud.public_id,
  //   url: cloud.secure_url,
  //   format: cloud.format,
  // };

  // return buffer;
};

async function compile(templateData, data) {
  const filePath = path.join(process.cwd(), "templates", `${templateData}.hbs`);

  const html = await fsPromises.readFile(filePath, "utf-8");

  return hbs.compile(html)(data);
}
