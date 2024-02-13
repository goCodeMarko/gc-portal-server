const padayon = require("./padayon"),
  cloudinary = require("./../services/cloudinary"),
  moment = require("moment"),
  fsPromises = require("fs/promises"),
  path = require("path"),
  puppeteer = require("puppeteer"),
  { Worker } = require("worker_threads"),
  hbs = require("handlebars");

module.exports.generate = async (template, data) => {
  // for (let index = 0; index < 10_000_000_000; index++) {}
  // console.log("finished");
  // const worker = new Worker("./worker-pdf.js");

  // worker.on("message", (data) => {
  //   console.log("----------------------------------------message", data);
  // });

  // worker.on("error", (data) => {
  //   console.log("----------------------------------------error", data);
  // });

  try {
    //disbaled some unused puppeteer feature to make it 60% faster.
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
        "--autoplay-policy=user-gesture-required",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-dev-shm-usage",
        "--disable-domain-reliability",
        "--disable-extensions",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-notifications",
        "--disable-offer-store-unmasked-wallet-cards",
        "--disable-popup-blocking",
        "--disable-print-preview",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-setuid-sandbox",
        "--disable-speech-api",
        "--disable-sync",
        "--hide-scrollbars",
        "--ignore-gpu-blacklist",
        "--metrics-recording-only",
        "--mute-audio",
        "--no-default-browser-check",
        "--no-first-run",
        "--no-pings",
        "--no-sandbox",
      ],
    });
    // const page = puppeteer.Browser.newPage();
    const page = await browser.newPage();

    // const filename = padayon.uniqueId({ fileExtension: "pdf" });
    const html = await compile(template, data);

    await page.setContent(html);

    const pdfReadStream = await page.createPDFStream({
      format: "Legal",
      orientation: "portrait",
    });

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
  /*
  const cloud = await cloudinary.uploader.upload(buffer, {
    folder: "random",
    type: "authenticated",
  });
  cloudinary.uploader
    .upload_stream(
      {
        folder: "random",
        resource_type: "auto",
        type: "authenticated",
      },
      (error, result) => {
        console.log("yowwww1");
      }
    )
    .end(buffer)

  await fsPromises.unlink(path.join(process.cwd(), "xfiles", filename));

  const details = {
    created_at: moment().format("MM-DD-YYYY_hh-mm-ss"),
    publicId: cloud.public_id,
    url: cloud.secure_url,
    format: cloud.format,
  };

  return buffer;
  */
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
