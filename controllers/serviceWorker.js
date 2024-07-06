const padayon = require("../services/padayon");
const fs = require("node:fs");


module.exports.subscribe = async (req, res) => {
    console.log('----------req.body', req.body)
    const subscription = req.body;
    // subscriptions.push(subscription);
    res.status(201).json({});
}; 


module.exports.notify = async (req, res) => {
    const sub = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/duxvw8T2Y10:APA91bHwGkh3l9FRzn5QYglEAbeUfwshdujK_uYBXTE6RZw96BukJrOgTvkjFj9hlFWcSvy3e1Pz5SzQeAl_HZuXXlRt4fZVIlzkkQQaRnQupvLiJBajVYTJjvP8jZVRF8toNkgQYC0',
        expirationTime: null,
        keys: {
            p256dh: 'BIA39EHy4YMbv-MgsEgftxwmy7yWHPMhvzTBUlfN1mif8rHUKc_w-SsLhD_iylXszW1RHN35YoIviAGQmpRHL7M',
            auth: 'yN3uUArFMBzL5_prlct5Ig'
        }
    }

    const notificationPayload = {
        notification: {
          title: 'New Notification',
          body: 'You have a new message.'
        },
      };
    
      Promise.all(subscriptions.map(sub => webpush.sendNotification(sub, JSON.stringify(notificationPayload))))
        .then(() => res.status(200).json({ message: 'Notification sent successfully.' }))
        .catch(err => {
          console.error('Error sending notification', err);
          res.sendStatus(500);
        });
}