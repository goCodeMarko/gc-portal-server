const
    padayon = require('./padayon'),
    cloudinary = require('./../helpers/cloudinary'),
    moment = require('moment'),
    fsPromises = require("fs/promises"),
    path = require('path'),
    puppeteer = require('puppeteer'),
    hbs = require('handlebars');


module.exports.generate = async (template, data) => {
    console.time('time');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const filename = padayon.uniqueId({ fileExtension: 'pdf' });
    const html = await compile(template, data);

    await page.setContent(html);

    const pdf = await page.pdf({
        path: `xfiles/${filename}`,
        format: 'Legal',
        orientation: 'portrait'
    });

    await browser.close();

    const cloud = await cloudinary.uploader.upload(path.join(process.cwd(), 'xfiles', filename), {
        folder: 'random',
        type: "authenticated"
    });

    //Removes the file
    await fsPromises.unlink(path.join(process.cwd(), 'xfiles', filename));

    const details = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
        created_at: moment().format('MM-DD-YYYY_hh-mm-ss'),
        format: cloud.format
    }
    console.timeEnd('time');
    return details;
}

async function compile(templateData, data) {
    const filePath = path.join(process.cwd(), 'templates', `${templateData}.hbs`);

    const html = await fsPromises.readFile(filePath, 'utf-8');

    return hbs.compile(html)(data);
}