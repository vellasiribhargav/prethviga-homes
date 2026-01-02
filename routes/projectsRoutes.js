const express = require('express');
const { getProjectsData } = require('../controllers/projectsController');
const router = express.Router();

router.get('/', getProjectsData);
module.exports = router;