const express = require('express');
const router = express.Router();
const controller = require('../controllers/blogDiscoverController');
const { createImageUpload } = require('../utils/commonFileupload');

const upload = createImageUpload('blogDiscover');

router.get('/:slug/:section/get', controller.getBlogs);
router.post('/:slug/:section/add', upload.any(), controller.addBlogs);
router.delete('/:slug/:section/delete/:index', controller.deleteBlog);

module.exports = router;