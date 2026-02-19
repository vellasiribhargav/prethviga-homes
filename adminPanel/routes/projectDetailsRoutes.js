const express = require('express');
const router = express.Router();
const projectDetailsController = require('../controllers/projectDetailsController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("projects");

router.get('/list', projectDetailsController.getProjectsList);
router.get('/details', projectDetailsController.renderDetailsPage);
router.get('/getdetails/:projectId', projectDetailsController.getDetailsByProject);
router.post('/save', upload.any(), projectDetailsController.saveProjectDetails);
router.get("/amenities/unique", projectDetailsController.getUniqueAmenities);

module.exports = router;