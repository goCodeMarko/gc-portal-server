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
            endpoint: 'https://web.push.apple.com/QMILCR4vfWIDEukrmsph3VUrhLJdXSGk2IPGnk_bzrtSxDUM7BECzyIngelD_a2cd_oHNTodLhZfZYT82fbyrGmveCi7VcvHItMU8pT3oehHG4oB4IFVpJBD4Bwa211uGb6Oi-c_gL6hJQdz8nCgJNW8xdKUhcyQ2SBGt_62YLY',
            expirationTime: null,
            keys: {
                p256dh: 'BIGU0RQ9difhtawBz4eYilHM6fW3uWL5x11aQuTL8x_fdU07WYqq9XBVSG0digcH1dN6BDURv_AionOH_QNgjYY',
                auth: '-fELZ2VE5Egi-6VIz-ikdA'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }