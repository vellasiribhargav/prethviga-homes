const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/getgallery', galleryController.getGallery);
router.get('/getgallery/:projectId', galleryController.getGalleryByProject);
router.post('/addgallery', upload.any(), galleryController.addGalleryItem);
router.put('/updategallery/:id', galleryController.updateGalleryItem);
router.delete('/deletegallery/:id', galleryController.deleteGalleryItem);

module.exports = router;