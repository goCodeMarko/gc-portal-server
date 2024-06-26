const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const _ = require("lodash");
const path = require("path");
const testEnv = ["local", "dev", "uat"];
const isTestMode = testEnv.includes(process.env.NODE_ENV) ? true : false;
// const subjectAppendedText = isTestMode ? " **FOR TESTING PURPOSES ONLY**" : "";

const username = isTestMode
  ? process.env.NODEMAILER_TEST_EMAIL
  : process.env.NODEMAILER_EMAIL;
const password = isTestMode
  ? process.env.NODEMAILER_TEST_PW
  : process.env.NODEMAILER_PW;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: username,
    pass: password,
  },
});

module.exports.notify = async (recipient, template, data = {}) => {
  console.log('----1', recipient)
  console.log('----2', template)
  console.log('----3', data)

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extname: ".handlebars", // handlebars extension
        layoutsDir: path.resolve(__dirname, '..', 'assets/templates'), // location of handlebars templates
        defaultLayout: template, // name of main template
        cache: false
      },
      viewPath: path.resolve(__dirname, '..', 'assets/templates'),
      extName: '.handlebars'
    })
  );

  const mail = {
    from: `"Kuweba Software Solutions" <${username}>`,
    to: recipient,
    subject: data.header,
    template: template, 
    attachments: [
      {
        filename: "email_banner.png",
        path: process.cwd() + `/assets/images/${data.banner}.png`,
        cid: "email_banner",
      },
      {
        filename: "facebook-icon.png",
        path: process.cwd() + "/assets/images/icons/facebook-icon.png",
        cid: "facebook-icon",
      },
      {
        filename: "instagram-icon.png",
        path: process.cwd() + "/assets/images/icons/instagram-icon.png",
        cid: "instagram-icon",
      },
      {
        filename: "youtube-icon.png",
        path: process.cwd() + "/assets/images/icons/youtube-icon.png",
        cid: "youtube-icon",
      },
     
    ],
    context: {
      ...data,
    },
  };

  if(_.size(data.attachments)){
    mail.attachments.push(...data.attachments)
  }
  
  const result = await transporter.sendMail(mail);  
  transporter.close();
  return result;
};
