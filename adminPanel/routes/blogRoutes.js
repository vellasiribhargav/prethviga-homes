const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");


router.get('/getblog', blogController.getBlog);
router.post('/addblog', upload.single('file'), blogController.addBlogItem);
router.put('/updateblog/:index', blogController.updateBlogItem);
router.delete('/deleteblog/:index', blogController.deleteBlogItem);

module.exports = router;