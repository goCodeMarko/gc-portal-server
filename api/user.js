'use_strict';

const
    lib = require('./../library'),
    execute = lib.execute,
    path = require('path'),
    base = path.basename(__filename).split('.').shift(),
    express = require('express'),
    router = express.Router(),
    root = `/api/${base}/`,
    query = require(`./../model/${base}`).methods;


// PUT REQUEST SECTION
router.put(root + 'editUserAccess', execute(query.editUserAccess, { 
        secured: true 
    })
);
// END


// POST REQUEST SECTION
router.post(root + 'authenticate', execute(query.authenticate, { 
        secured: true 
    })
);
// END


// GET REQUEST SECTION
router.get(root + 'userInfo', execute(query.userInfo, { 
        secured: true 
    })
);

router.get(root + 'allUsers', execute(query.allUsers, { 
        secured: true 
    })
);
// END



module.exports = router