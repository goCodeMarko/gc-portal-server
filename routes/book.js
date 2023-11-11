"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/${base}`);

router.get(
  `/api/${base}/getBooks`,
  execute(controller.getBooks, {
    secured: true,
    role: ["user"],
  })
); //---------done

router.put(
  `/api/${base}/deleteBook/:id`,
  execute(controller.deleteBook, {
    secured: true,
    role: ["user"],
    strict: { isallowedtodelete: true },
  })
); //---------done

router.put(
  `/api/${base}/updateBook/:id`,
  execute(controller.updateBook, {
    secured: true,
    role: ["user"],
    strict: { isallowedtoupdate: true },
  })
); //---------done

router.post(
  `/api/${base}/addBook`,
  execute(controller.addBook, {
    secured: true,
    role: ["user"],
    strict: { isallowedtocreate: true },
  })
); //---------done

module.exports = router;
