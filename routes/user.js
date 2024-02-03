"use_strict";

const { execute } = require("../services/padayon"),
  path = require("path"),
  base = path.basename(__filename, ".js"),
  express = require("express"),
  router = express.Router(),
  controller = require(`../controllers/user`),
  multer = require("./../services/multer");

router.get(
  `/api/${base}/getUser/:id`,
  execute(controller.getUser, {
    secured: true,
  })
); //---------done

router.get(
  `/api/${base}/getAuthUser`,
  execute(controller.getAuthUser, {
    secured: true,
  })
); //---------done

router.get(
  `/api/${base}/getUsers`,
  execute(controller.getUsers, {
    secured: true,
  })
); //---------done

router.put(
  `/api/${base}/updateUserAccess/:id`,
  execute(controller.updateUserAccess, {
    secured: true,
  })
); //---------done

router.post(
  `/api/${base}/authenticate`,
  execute(controller.authenticate, {
    secured: false,
  })
); //---------done

router.post(
  `/api/${base}/saveFile`,
  multer.single("image"),
  execute(controller.saveFile, {
    secured: false,
  })
);

router.post(
  `/api/${base}/saveMultipleFiles`,
  multer.array("photos", 2),
  execute(controller.saveMultipleFiles, {
    secured: false,
  })
);

router.put(
  `/api/${base}/generateQR`,
  execute(controller.generateQR, {
    secured: true,
  })
); //---------done

router.put(
  `/api/${base}/generateIdCard`,
  execute(controller.generateIdCard, {
    secured: true,
  })
); //---------done

router.put(
  `/api/${base}/generateBarcode`,
  execute(controller.generateBarcode, {
    secured: true,
  })
); //---------done

// router.get(
//   `/api/${base}/getFile`,
//   multer.single("image"),
//   execute(controller.getFile, {
//     secured: true,
//   })
// );

router.get(
  `/api/${base}/downloadPDF`,
  execute(controller.downloadPDF, {
    secured: true,
  })
);

router.get(
  `/api/${base}/downloadExcel`,
  execute(controller.downloadExcel, {
    secured: true,
  })
); //---------done

// router.get(
//   `/api/${base}/downloadCSV`,
//   execute(controller.downloadCSV, {
//     secured: true,
//   })
// );
/*
router.get(
  `/api/${base}/fileDownload/:public_id`,
  execute(controller.fileDownload, {
    secured: true,
  })
);
*/
module.exports = router;
