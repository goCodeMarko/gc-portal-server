const
    pdf = require("pdf-creator-node"),
    cloudinary = require('./../utils/cloudinary'),
    moment = require('moment'),
    fs = require("fs");


module.exports.generate = async (set) => {
    
    const result = setupPDF(set);
    const file = await pdf.create(result.document, result.options);

    const cloud = await cloudinary.uploader.upload(file.filename, {
        folder: set?.cloudinaryFolder ? set.cloudinaryFolder : '',
        type: "authenticated"
    });

    const details = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
        created_at: moment().format('MM-DD-YYYY_hh-mm-ss'),
        format: cloud.format
    }

    return details;
}


function setupPDF(set) {
    if (!set.hasOwnProperty('format') || !set.format) set.format = 'A5';
    if (!set.hasOwnProperty('data') || !set.data) set.data = [];
    if (!set.hasOwnProperty('template') || !set.template) set.template = '';

    const template = fs.readFileSync(set.template, 'utf8');
    const options = {
        format: set.format,
        orientation: 'portrait',
        border: '3mm',
    };
    const document = {
        html: template,
        data: {
            data: set.data
        },
        path: 'template/output.pdf',
        type: ''
    };

    return { options, document }
}
