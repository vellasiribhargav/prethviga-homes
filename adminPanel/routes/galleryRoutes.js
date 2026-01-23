const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

router.get('/', galleryController.renderGalleryMainPage);
router.get('/list', galleryController.getGallery);
router.get('/getgallery/:projectId', galleryController.getGalleryByProject);
router.post('/addgallery', upload.any(), galleryController.addGalleryItem);
router.put('/updategallery/:index', upload.single('file'), galleryController.updateGalleryItem);
router.delete('/deletegallery/:index', galleryController.deleteGalleryItem);

module.exports = router;