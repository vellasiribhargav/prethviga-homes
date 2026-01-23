const express = require('express');
const router = express.Router();
const controller = require('../controllers/blogController');
const { createImageUpload } = require('../utils/commonFileupload');

const upload = createImageUpload('blog');

router.get('/', controller.renderBlogMainPage);
router.get('/:slug/:section/list', controller.getBlogsList);
router.get('/:slug/:section/get', controller.getBlogs);
router.post('/:slug/:section/add', upload.any(), controller.addBlogs);
router.put('/:slug/:section/update/:index', upload.single('file'), controller.updateBlog);
router.delete('/:slug/:section/delete/:index', controller.deleteBlog);

module.exports = router;