const express = require('express');
const router = express.Router();
const completedController = require('../controllers/completedController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/getcompleted', completedController.getcompletedGallery);
router.post('/addcompleted', upload.single('file'), completedController.addcompletedItem);
router.put('/updatecompleted/:id', completedController.updatecompletedItem);
router.delete('/deletecompleted/:id', completedController.deletecompletedItem);

module.exports = router;