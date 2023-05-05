const
    padayon = require('./padayon'),
    path = require('path'),
    pdf = require("pdf-creator-node"),
    cloudinary = require('./../helpers/cloudinary'),
    moment = require('moment'),
    fsPromises = require("fs/promises");


module.exports.generate = async (args) => {
    console.time('timer')
    args.filename = padayon.uniqueId({ fileExtension: 'pdf' });
    const result = await setupPDF(args);
    const file = await pdf.create(result.document, result.options);
    const cloud = await cloudinary.uploader.upload(file.filename, {
        folder: args.cloudinaryFolder ? args.cloudinaryFolder : 'random',
        type: "authenticated"
    });

    //Removes the newly copied file
    await fsPromises.unlink(path.join(__dirname, '..', 'xfiles', args.filename));

    const details = {
        public_id: cloud.public_id,
        url: cloud.secure_url,
        created_at: moment().format('MM-DD-YYYY_hh-mm-ss'),
        format: cloud.format
    }
    console.timeEnd('timer')
    return details;
}


async function setupPDF(args) {
    const options = {
        format: 'Legal',
        orientation: 'portrait',
        border: {
            top: '6mm',
            right: '6mm',
            bottom: '6mm',
            left: '6mm'
        },
        timeout: 180000,
        childProcessOptions: {
            env: {
                OPENSSL_CONF: '/dev/null',
            }
        }
    };
  
    const template = await fsPromises.readFile(`templates${String.fromCharCode(47)}${args.template}.html`, 'utf8');
    console.log('template', Buffer.from(template))
    //Creates a copy of xfiles/base.pdf with unique file name
    const 
        srcFile = path.join(__dirname, '..', 'xfiles', 'base.pdf'),
        destFile = path.join(__dirname, '..', 'xfiles', args.filename);

    await fsPromises.copyFile(srcFile, destFile)

    const document = {
        html: template,
        data: args.data,
        path: 'xfiles/' + args.filename,
        cloudinaryFolder: args.cloudinaryFolder || 'random',
        filename: args.filename,
        type: ''
    };
    return { options, document }
}
