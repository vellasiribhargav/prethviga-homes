const express = require('express');
const router = express.Router();
const completedController = require('../controllers/completedController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/', completedController.renderCompletedPage);
router.get('/list', completedController.getcompletedGallery);
router.get('/getcompleted', completedController.getCompletedProjectsJSON);
router.post('/addcompleted', upload.any(), completedController.addcompletedItem);
router.put('/updatecompleted/:index', upload.single('file'), completedController.updatecompletedItem);
router.delete('/deletecompleted/:index', completedController.deletecompletedItem);

module.exports = router;