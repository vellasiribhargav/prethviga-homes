const express = require('express');
const router = express.Router();
const controller = require('../controllers/blogController');
const { createImageUpload } = require('../utils/commonFileupload');

const upload = createImageUpload('gallery');

router.get('/', controller.renderBlogMainPage);
router.get('/list', controller.getBlogsList);
router.get('/get', controller.getBlogs);
router.post('/add', upload.any(), controller.addBlogs);
router.put('/update/:id', upload.single('file'), controller.updateBlog);
router.delete('/delete/:id', controller.deleteBlog);

router.get('/:slug/:section/list', controller.getBlogsList);
router.get('/:slug/:section/get', controller.getBlogs);
router.post('/:slug/:section/add', upload.any(), controller.addBlogs);
router.put('/:slug/:section/update/:id', upload.single('file'), controller.updateBlog);
router.delete('/:slug/:section/delete/:id', controller.deleteBlog);

module.exports = router;