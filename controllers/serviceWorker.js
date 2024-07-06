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
            endpoint: 'https://fcm.googleapis.com/fcm/send/duxvw8T2Y10:APA91bHwGkh3l9FRzn5QYglEAbeUfwshdujK3_uYBXTE6RZw96BukJrOgTvkjFj9hlFWcSvy3e1Pz5SzQeAl_HZuXXlRt4fZVIlzkkQQaRnQupvLiJBajVYTJjvP8jZVRF8toNkgQYC0',
            expirationTime: null,
            keys: {
                p256dh: 'BIA39EHy4YMbv-MgsEgftxwmy7yWHPMhvzTBUlfN1mif8rHUKc_w-SsLhD_iylXszW1RHN35YoIviAGQmpRHL7M',
                auth: 'yN3uUArFMBzL5_prlct5Ig'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }