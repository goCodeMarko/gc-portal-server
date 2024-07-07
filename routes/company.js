"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/${base}`);


router.get(
  `/api/${base}/getCompanies`,
  execute(controller.getCompanies, {
    secured: true,
    role: ["frontliner", "admin"],
    strict: { isallowedtocreate: true },
  })
); 

router.post(
    `/api/${base}/subscribe`,
    execute(controller.subscribe, {
      secured: true,
      role: ["admin", "frontliner"]
    })
  ); 

router.get(
    `/api/${base}/notify`,
    execute(controller.notify, {
      secured: true,
      role: ["admin", "frontliner"]
    })
); 

module.exports = router;
