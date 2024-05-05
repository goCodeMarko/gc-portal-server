"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/${base}`),
  multer = require("./../services/multer");

router.post(
  `/api/${base}/createTransaction`,
  execute(controller.createTransaction, {
    secured: true,
    role: ["admin"],
    strict: { isallowedtocreate: true },
  })
); //---------done

router.get(
  `/api/${base}/getTransaction`,
  execute(controller.getTransaction, {
    secured: true,
    role: ["frontliner", "admin"],
    strict: { isallowedtocreate: true },
  })
); //---------done

router.post(
  `/api/${base}/addTransaction`,
  execute(controller.addTransaction, {
    secured: true,
    role: ["frontliner", "admin"],
    strict: { isallowedtocreate: true },
  })
); //---------done

router.put(
  `/api/${base}/updateCICO`,
  execute(controller.updateCICO, {
    secured: true,
    role: ["frontliner", "admin"],
  })
); //---------done

router.put(
  `/api/${base}/updateTransactionStatus`,
  multer.single("screenshot"),
  execute(controller.updateTransactionStatus, {
    secured: true,
    role: ["frontliner", "admin"],
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
