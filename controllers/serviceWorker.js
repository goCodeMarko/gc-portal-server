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
            endpoint: 'https://web.push.apple.com/QBvqYoEscZ8-Xf8PWnTu-CTekNYNi4CyMSuqTIQ2xKPxDHQkFbNtogZP_HlBn2YasvMQ-VFt_VgVXLjlJ0hYpM_U2fe3W9oJA5V5zbuYu92z1wFciq1CAntfSIoTlTeNZ03fZ3WZX1NSFdpZfdjJYHR5n4gPwXcghRUJEide6gc',
            expirationTime: null,
            keys: {
                p256dh: 'BBqmjFbCMZFPSO9YuuRqfzHoTOVELfhXNByvFG21bz1E-3yp5Ksjphk9uTISZVIpaYRDBx82Xms9V08QWnFZTto',
                auth: 'k7H7aemEaxIwiBfEJLaErA'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }