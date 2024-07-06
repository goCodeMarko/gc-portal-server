const padayon = require("../services/padayon");
const fs = require("node:fs");
const webpush = require('web-push');


module.exports.subscribe = async (req, res) => {
    console.log('----------req.body', req.body)
    const subscription = req.body;
    // subscriptions.push(subscription);
    res.status(201).json({});
}; 


module.exports.notify = async (req, res) => {
    try {
        console.log('-----------------xxxxxxxxx');
        const VAPID_PUBLIC_KEY = 'BENFs5s5g4eYPr8DmBtmI7V46TAQhjv22N31JJVVNoicaefJcrM8ezT6XSvt4SUPqk2rt9JfzmuhzTCUr98DPNI';
        const VAPID_PRIVATE_KEY = 'JTeljBhHFTY9leAHY_M1YwQQY51bvnzRhQHi1MLBoAg';
        const notificationPayload = {
            notification: {
              title: 'New Notification',
              body: 'You have a new message.'
            },
          };
          
     webpush.setVapidDetails(
        'mailto:patrickmarckdulaca@gmail.com',
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
      );
        const x= await webpush.sendNotification({
            endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABmiJ5nHm0eu58MCNmB55dLKymnERWaSrc60OdA66ybE4WPJ87VNHJbDtWVFy-1sgs0R2t22FITX7rV03z6tV7u3n7mD0F_oK2IW9pIuL9J6XSvTCOK-PPi3RI7DCpSBCES1jLNz3Njb2GmL6A0YbfYjXXpPIPXau42CuaUMOe1k6oQwYk',
            expirationTime: null,
            keys: {
              auth: 'TsINXBfcvnoRwfQlLazigQ',
              p256dh: 'BKZlkNg5U-syzxCXcMFqQiD32GffaJreMGyjGgTi0DH8secdHd6tnp5rWEK_hSbTP6STIw-ar3WITxtUsunWzQk'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }