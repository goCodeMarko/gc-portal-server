const webpush = require('web-push'),
  padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  model = require(`./../models/${base}`);


module.exports.subscribe = async (req, res) => {
    try {
        let response = { success: true, code: 201 };
        console.log('------------req.body', req.body)
        console.log('------------req.auth', req.auth)
        let body = {
            endpoint: req.body.endpoint,
            expirationTime: req.body.expirationTime,
            keys: {
                p256dh: req.body.p256dh,
                auth: req.body.auth,
            },
            company: req.auth.company,
            branch:  req.auth.branch,
            role:  req.auth.role,
            uid:  req.auth._id,
        };
   
        req.fnParams = {
        ...body,
        };
        // await model.subscribe(req, res, async (result) => {
            // response.data = result;

        // });
        return response;
    } catch (error) {
        padayon.ErrorHandler(
            "Controller::Company::subscribe",
            error,
            req,
            res
          );
    }
}; 

module.exports.notify = async (req, res) => {
    try {
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