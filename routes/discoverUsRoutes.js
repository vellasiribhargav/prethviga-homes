const express = require('express');
const { getdiscoverUsData, getBlogById } = require('../controllers/discoverUsController');
const router = express.Router();

router.get('/', getdiscoverUsData);
router.get('/blog/:id', getBlogById);

module.exports = router;