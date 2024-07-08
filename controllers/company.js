const webpush = require('web-push'),
  padayon = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  model = require(`./../models/${base}`);


module.exports.subscribe = async (req, res) => {
    try {
        let response = { success: true, code: 201 };

        let body = {
            endpoint: req.body.endpoint,
            expirationTime: req.body.expirationTime,
            keys: {
                p256dh: req.body.keys.p256dh,
                auth: req.body.keys.auth,
            },
            company: req.auth.company,
            branch:  req.auth.branch,
            role:  req.auth.role,
            uid:  req.auth._id,
        };
   
        req.fnParams = {
        ...body,
        };
       const checkIfSubscriberExists =  await model.getSubsciber(req, res);

       if(!checkIfSubscriberExists){
        response.data =  await model.subscribe(req, res);
       }else {
        response.data = 'Exists';
       }
 
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
        let response = { success: true, code: 201 };
        let body = {
            company: req.query?.company,
            branch: req.query?.branch,
            role: req.query?.role,
            uid: req.query?.uid
        };
        req.fnParams = {
        ...body,
        };
        const result =  await model.notify(req, res);
        response.data = result;

        const VAPID_PUBLIC_KEY = 'BENFs5s5g4eYPr8DmBtmI7V46TAQhjv22N31JJVVNoicaefJcrM8ezT6XSvt4SUPqk2rt9JfzmuhzTCUr98DPNI';
        const VAPID_PRIVATE_KEY = 'JTeljBhHFTY9leAHY_M1YwQQY51bvnzRhQHi1MLBoAg';
        const notificationPayload = {
            notification: {
              title: req.query?.title,
              body: req.query?.body
            },
          };

        webpush.setVapidDetails(
            'mailto:patrickmarckdulaca@gmail.com',
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );
        
        if(result) {
            result.forEach(data => {
                webpush.sendNotification({
                    endpoint: data.deviceSubscriptions?.endpoint,
                    expirationTime: data.deviceSubscriptions?.expirationTime,
                    keys: {
                        p256dh: data.deviceSubscriptions?.keys?.p256dh,
                        auth: data.deviceSubscriptions?.keys?.auth
                    }
                }, JSON.stringify(notificationPayload));
            });
        }

        return response;
    } catch (error) {
        padayon.ErrorHandler(
            "Controller::Company::notify",
            error,
            req,
            res
          );
    }     
}