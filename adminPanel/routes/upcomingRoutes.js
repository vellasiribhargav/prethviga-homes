const express = require('express');
const router = express.Router();
const upcomingController = require('../controllers/upcomingController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/', upcomingController.renderUpcomingPage);
router.get('/list', upcomingController.getupcomingGallery);
router.get('/getupcoming', upcomingController.getUpcomingProjectsJSON);
router.post('/addupcoming', upload.any(), upcomingController.addupcomingItem);
router.put('/update/:id', upload.single('file'), upcomingController.updateupcomingItem);
router.delete('/delete/:id', upcomingController.deleteupcomingItem);

module.exports = router;