const padayon = require("./padayon"),
  cloudinary = require("./../services/cloudinary"),
  moment = require("moment"),
  fsPromises = require("fs/promises"),
  path = require("path"),
  puppeteer = require("puppeteer"),
  hbs = require("handlebars");

module.exports.generate = async (template, data) => {
  try {
    console.log(8);
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log(9);
    const page = await browser.newPage();
    console.log(10);
    // const filename = padayon.uniqueId({ fileExtension: "pdf" });
    const html = await compile(template, data);
    console.log(11);
    await page.setContent(html);
    console.log(12);
    const pdfReadStream = await page.createPDFStream({
      format: "Legal",
      orientation: "portrait",
    });
    console.log(13);
    pdfReadStream.on("close", async () => {
      await browser.close();
    });

    pdfReadStream.on("error", async () => {
      await browser.close();
    });

    return pdfReadStream;
  } catch (error) {
    padayon.ErrorHandler("Controller::User::downloadPDF", error, req, res);
  } //---------done

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
  const filePath = path.join(
    process.cwd(),
    "assets",
    "templates",
    `${templateData}.handlebars`
  );

  const html = await fsPromises.readFile(filePath, "utf-8");

  return hbs.compile(html)(data);
}
