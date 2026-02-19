const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.get("/", reviewController.renderReviewsPage);
router.get("/list", reviewController.renderReviewsListPage);
router.get("/get", reviewController.getReviews);
router.put("/update", reviewController.updateReviews);
router.delete("/delete/:index", reviewController.deleteReview);

module.exports = router;