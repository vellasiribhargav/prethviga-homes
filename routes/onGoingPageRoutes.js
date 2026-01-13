const express = require('express');
const { getonGoingPageData } = require('../controllers/onGoingPageController');
const router = express.Router();

router.get('/:id', getonGoingPageData);

module.exports = router;