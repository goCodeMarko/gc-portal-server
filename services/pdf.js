const padayon = require("./padayon"),
  cloudinary = require("./../services/cloudinary"),
  moment = require("moment"),
  fsPromises = require("fs/promises"),
  path = require("path"),
  puppeteer = require("puppeteer"),
  { Worker } = require("worker_threads"),
  hbs = require("handlebars");

module.exports.generate = async (template, data) => {
  try {
    console.log('--------2.1')
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
      ]
      });
      console.log('--------2.2')
    
    const page = await browser.newPage();
    console.log('--------2.3')
    const html = await compile(template, data);
    console.log('--------2.4')
    await page.setContent(html);

    // await page.screenshot({
    //   path: 'screenshot.jpg',
    //   fullPage: true,
    //   quality: 100
    // });
    console.log('--------2.5')
    const pdfBuffer = await page.pdf({
      format: "Legal",
      orientation: "portrait",
      printBackground: true,
      timeout: 0
    });
    console.log('--------2.6')
    // const pdfStream = await page.createPDFStream({
    //   format: "Legal",
    //   orientation: "portrait",
    //   printBackground: true
    // });
    // pdfReadStream.on("close", async () => {
    //   await browser.close();
    // });

    // pdfReadStream.on("error", async () => {
    //   await browser.close();
    // });

    return pdfBuffer;
  } catch (error) {
    padayon.ErrorHandler("Service::Pdf::generate", error, req, res);
  } 
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
