'use_strict';

const
    lib = require('../library'),
    execute = lib.execute,
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    express = require('express'),
    router = express.Router(),
    url = `/api/${base}/`,
    query = require(`./../model/${base}`).methods;



router.get(url + 'allBooks', execute(query.allBooks, { 
        secured: true, 
        role: ['user']
    })
);

router.put(url + 'deleteBook', execute(query.deleteBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtodelete: true }
    }
));

router.put(url + 'editBook', execute(query.editBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtoupdate: true }
    }
));

router.post(url + 'addBook', execute(query.addBook, { 
        secured: true, 
        role: ['user'],
        strict: {  isallowedtocreate: true }
    }
));

module.exports = router;