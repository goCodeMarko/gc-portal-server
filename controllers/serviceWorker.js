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
            endpoint: 'https://web.push.apple.com/QEdgp5vrY6KGZ747x2FpxxWgcnf4JbVKXd6XAlbK1la4jP-K5D9Iu0OW2onMbV_1R8n9jufgHC1ta-X-E9lagwu8TIMJltVJEiqkVkZ5fQnhGrnOBoftKScBKPUV61_BhxtYYoQf--GA4BIQmu2pZjajGt3qDVPNl7TeeYcv6Dk',
            expirationTime: null,
            keys: {
                p256dh: 'BBQJbNN2HELyhEGcAWbD_JJu40nyjrGHaa70hDSHVfg7HuIWXkAMJZGXnHe3XZF42S3Mr6waT215XDtXlw8z7PA',
                auth: 'lUzqJ3JF5cUYsIVhvEw90g'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }