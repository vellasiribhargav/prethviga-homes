const express = require('express');
const router = express.Router();
const blogDiscoverController = require('../controllers/blogDiscoverController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("blogDiscover");

// router.get('/', blogDiscoverController.renderBlogDiscoverPage);
router.get('/getblogdiscover', blogDiscoverController.getBlogDiscover);
router.post('/addblogdiscover', upload.array('file', 10), blogDiscoverController.addBlogDiscoverItem);
router.put('/updateblogdiscover/:index', upload.single('file'), blogDiscoverController.updateBlogDiscoverItem);
router.delete('/deleteblogdiscover/:index', blogDiscoverController.deleteBlogDiscoverItem);

module.exports = router;