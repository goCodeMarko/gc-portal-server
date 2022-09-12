const
    padayon = require('./padayon'),
    path = require('path'),
    pdf = require("pdf-creator-node"),
    cloudinary = require('./../helpers/cloudinary'),
    moment = require('moment'),
    fs = require("fs");


module.exports.generate = async (set) => {
    set.filename = padayon.uniqueId({ fileExtension: 'pdf' });
    const result = await setupPDF(set);

    const file = await pdf.create(result.document, result.options);

    const cloud = await cloudinary.uploader.upload(file.filename, {
        folder: set?.cloudinaryFolder ? set.cloudinaryFolder : '',
        type: "authenticated"
    });

    //Removes the newly copied file
    fs.rmSync(path.join(__dirname, '..', 'xfiles', set.filename));

    const details = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
        created_at: moment().format('MM-DD-YYYY_hh-mm-ss'),
        format: cloud.format
    }

    return details;
}


async function setupPDF(set) {
    if (!set.hasOwnProperty('format') || !set.format) set.format = 'A5';
    if (!set.hasOwnProperty('data') || !set.data) set.data = [];
    if (!set.hasOwnProperty('columns') || !set.columns) set.columns = [];
    if (!set.hasOwnProperty('template') || !set.template) set.template = '';

    const template = fs.readFileSync(set.template, 'utf8');
    const options = {
        format: set.format,
        orientation: 'portrait',
        border: {
            top: '6mm',        
            right: '6mm',
            bottom: '6mm',
            left: '6mm'
        }
    };

    //Creates a copy of xfiles/base.pdf with unique file name
    fs.copyFileSync(path.join(__dirname, '..', 'xfiles', 'base.pdf'), path.join(__dirname, '..', 'xfiles', set.filename));

    const document = {
        html: template,
        data: set.data,
        path: 'xfiles/' + set.filename,
        type: ''
    };

    return { options, document }
}
