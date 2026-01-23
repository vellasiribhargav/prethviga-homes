const express = require("express");
const router = express.Router();
const path = require("path");

const bannerController = require("../controllers/bannerController");
const { createImageUpload } = require("../utils/commonFileupload");

// Dynamic folder generation based on slug
const dynamicUpload = createImageUpload((req) => {
  const slug = req.params.slug;
  // Map standard slugs to folder names if needed, or just append 'banner'
  // My controller config uses: uploads/homebanner/, uploads/projectbanner/, etc.
  // So slug="home" -> "uploads/homebanner"
  return path.join('uploads', slug + 'banner');
});

router.get("/", bannerController.renderBannerMainPage);
router.get("/:slug/list", bannerController.getBannersList);
router.get("/:slug/get", bannerController.getBanners);

router.post(
  "/:slug/add",
  dynamicUpload.array("banners"),
  bannerController.addBanners
);

router.put(
  "/:slug/update/:index",
  dynamicUpload.single("file"),
  bannerController.updateBanner
);

router.delete(
  "/:slug/delete/:index",
  bannerController.deleteBanner
);

module.exports = router;
