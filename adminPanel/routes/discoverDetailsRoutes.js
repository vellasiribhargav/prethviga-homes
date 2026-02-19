const express = require('express');
const router = express.Router();
const discoverDetailsController = require('../controllers/discoverDetailsController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/', discoverDetailsController.renderDiscoverDetailsPage);
router.get('/getdetails', discoverDetailsController.getDiscoverDetails);
router.post('/save', discoverDetailsController.saveDiscoverDetails);
router.get("/guide-rows/unique", discoverDetailsController.getUniqueGuideRows);

module.exports = router;