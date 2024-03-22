"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/${base}`);

router.post(
  `/api/${base}/addTransaction`,
  execute(controller.addTransaction, {
    secured: true,
    role: ["frontliner", "admin"],
    strict: { isallowedtocreate: true },
  })
); //---------done

router.get(
  `/api/${base}/getCashOuts`,
  execute(controller.getCashOuts, {
    secured: true,
    role: ["frontliner", "admin"],
  })
); //---------done

router.get(
  `/api/${base}/getCashIns`,
  execute(controller.getCashIns, {
    secured: true,
    role: ["frontliner", "admin"],
  })
); //---------done

module.exports = router;
