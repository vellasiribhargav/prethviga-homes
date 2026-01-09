const express = require('express');
const router = express.Router();
const ongoingController = require('../controllers/galleryController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/getgallery', ongoingController.getGallery);
router.post('/addgallery', upload.single('file'), ongoingController.addGalleryItem);
router.put('/updategallery/:id', ongoingController.updateGalleryItem);
router.delete('/deletegallery/:id', ongoingController.deleteGalleryItem);

module.exports = router;