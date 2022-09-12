'use_strict';

const
    { execute } = require('../helpers/padayon'),
    path = require('path'),
    base = path.basename(__filename, '.js'),
    express = require('express'),
    router = express.Router(),
    controller = require(`../controllers/${base}`);


router.get(`/api/${base}/getBooks`, execute(controller.getBooks, { 
        secured: true, 
        role: ['user']
    }
));

router.put(`/api/${base}/deleteBook`, execute(controller.deleteBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtodelete: true }
    }
));

router.put(`/api/${base}/editBook`, execute(controller.editBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtoupdate: true }
    }
));

router.post(`/api/${base}/addBook`, execute(controller.addBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtocreate: true }
    }
));


module.exports = router;