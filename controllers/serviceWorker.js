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
            endpoint: 'https://web.push.apple.com/QI8I8CdhNf5V5ZTpHXJrIHm90awuUapm07fDx6rJxSn_Q-DEhEDgi6u7x0t6h0blTcwXX_co4pIBqnwtoRXBVAok7Z8Ll1H2Ow__Ez7f16GZiQlMrLVGWPJxZIG87hjSRWNiu6reGNv0DO5kapL5WwR4K2i8C_MdNh5bRHY0zMk',
            expirationTime: null,
            keys: {
                p256dh: 'BKpqv4z9bv-446a7Yvie-PtMj087uIsyf3KVjVNrG4IvcpBJufTaXAA6Zt9mY8xfOH_V1plvFvkG9aRUGRthjFc',
                auth: '6fCm5eWjVPw_LEXG6MPlbg'
            }
        }, JSON.stringify(notificationPayload));

        console.log('-----------------notify', x)
    } catch (error) {
        console.log('-------------------error', error)
    }

       
    }