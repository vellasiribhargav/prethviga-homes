const express = require('express');
const router = express.Router();
const upcomingController = require('../controllers/upcomingController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");


// router.get('/', upcomingController.renderUpcomingPage);
router.get('/getupcoming', upcomingController.getupcomingGallery);
router.post('/addupcoming', upload.any(), upcomingController.addupcomingItem);
router.put('/updateupcoming/:index', upload.single('file'), upcomingController.updateupcomingItem);
router.delete('/deleteupcoming/:index', upcomingController.deleteupcomingItem);

module.exports = router;