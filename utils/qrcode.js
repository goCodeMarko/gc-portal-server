const 
    { createCanvas, loadImage } = require('canvas'),
    QRCode = require('qrcode'),
    cloudinary = require('./../utils/cloudinary').uploader;

module.exports.generate= async () => {
    const code = 'E-9271996143000001';
    const result = uploadQRCode(code);

    return result;
}

async function uploadQRCode(code) {
    const qrCodeBase64 = await createQRCodeImg(code);

    //uploads the qr code image on the cloudinary
    const upload = await cloudinary.upload(qrCodeBase64, {
        folder: 'qr_codes',
        type: "authenticated"
    });

    return upload;
}

async function createQRCodeImg(code) {
    //create canvas for qr
    const qrCodecanvas = createCanvas(164, 164);
    const qrCodeContext = qrCodecanvas.getContext("2d");

    //insert qrcode image on the qr canvas
    QRCode.toCanvas(
        qrCodecanvas,
        code,
        {
            errorCorrectionLevel: 'H',
            version: 4,
            type: 'image/jpeg',
            quality: 1,
            color: {
                dark: "#000000",
                light: "#ffffff"
            }
        }
    );

    //styling the logo canvas
    const logo = await loadImage('https://res.cloudinary.com/dhmkfau4h/image/upload/v1662251312/logo/Jollibee-logo-29FA57EDE1-seeklogo.com_j4kj0y.png');
    const logoCanvas = createCanvas(44, 47);
    const logoContext = logoCanvas.getContext('2d');
    logoContext.fillStyle = "#ffffff";
    logoContext.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
    logoContext.drawImage(logo, 6, 6, 32, 35);

    //inserts the logo on qrcode canvas
    qrCodeContext.drawImage(logoCanvas, 65, 64, 34, 37);
    
    const base64 = qrCodecanvas.toDataURL("image/png");

    return base64;
}
