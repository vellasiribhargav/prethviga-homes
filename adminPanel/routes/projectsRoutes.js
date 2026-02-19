const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectsController');
const { createImageUpload } = require("../utils/commonFileupload");

const upload = createImageUpload("gallery");

// Form page (Add/Edit)
router.get('/', controller.renderInventoryForm);

router.get('/list', controller.getInventoryList);

router.get('/data', controller.getInventoryJSON);
router.post('/add', upload.any(), controller.addInventoryItem);
router.put('/:type/update/:id', upload.single('file'), controller.updateInventoryItem);
router.delete('/:type/delete/:id', controller.deleteInventoryItem);

module.exports = router;