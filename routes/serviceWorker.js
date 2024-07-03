"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/${base}`);

// router.post(
//   `/api/${base}/createTransaction`,
//   execute(controller.createTransaction, {
//     secured: true,
//     role: ["admin"],
//     strict: { isallowedtocreate: true },
//   })
// ); 
router.post(
  `/api/${base}/subscribe`,
  execute(controller.subscribe, {
    secured: false,
    role: ["admin", "frontliner"]
  })
); 

module.exports = router;



