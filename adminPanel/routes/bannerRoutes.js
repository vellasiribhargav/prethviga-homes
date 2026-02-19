const express = require("express");
const router = express.Router();
const path = require("path");

const bannerController = require("../controllers/bannerController");
const { createImageUpload } = require("../utils/commonFileupload");

// Dynamic folder generation based on slug
const dynamicUpload = createImageUpload((req) => {
  return path.join('uploads', 'gallery');
});

router.get("/", bannerController.renderBannerMainPage);
router.get("/:slug/list", bannerController.getBannersList);
router.get("/:slug/get", bannerController.getBanners);

router.post(
  "/:slug/add",
  dynamicUpload.array("banners"),
  bannerController.addBanners
);

router.put("/:slug/update-text", dynamicUpload.any(), bannerController.updateSectionText);
router.put(
  "/:slug/update/:id",
  dynamicUpload.single("file"),
  bannerController.updateBanner
);

router.delete(
  "/:slug/delete/:id",
  bannerController.deleteBanner
);

module.exports = router;