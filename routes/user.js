'use_strict';

const
    { execute } = require('../library'),
    path = require('path'),
    base = path.basename(__filename, '.js'),
    express = require('express'),
    router = express.Router(),
    controller = require(`../controllers/user`),
    upload = require('./../utils/multer');


router.get(`/api/${base}/getUser`, execute(controller.getUser, { 
        secured: true 
    })
);

router.get(`/api/${base}/getUsers`, execute(controller.getUsers, { 
        secured: true 
    })
);

router.put(`/api/${base}/updateUserAccess`, execute(controller.updateUserAccess, { 
        secured: true 
    })
);

router.post(`/api/${base}/authenticate`, execute(controller.authenticate, { 
        secured: false
    })
);

router.post(`/api/${base}/checkAccess`, execute(controller.checkAccess, {
        secured: false
    })
);

router.post(`/api/${base}/saveFile`, upload.single('image'), 
        execute(controller.saveFile, {
        secured: true
    })
);

router.get(`/api/${base}/generateQR`, upload.single('image'),
    execute(controller.generateQR, {
        secured: true
    })
);

router.get(`/api/${base}/getFile`, upload.single('image'),
    execute(controller.getFile, {
        secured: true
    })
);

router.get(`/api/${base}/downloadPDF`, upload.single('image'),
    execute(controller.downloadPDF, {
        secured: true
    })
);


module.exports = router