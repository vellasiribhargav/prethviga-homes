const express = require('express');
const router = express.Router();
const controller = require('../controllers/faqController');

router.get('/', controller.renderFaqMainPage);
router.get('/:slug/:section/list', controller.getFaqsList);
router.get('/:slug/:section/get', controller.getFaqs);
router.post('/:slug/:section/add', controller.addFaqs);
router.put('/:slug/:section/update/:index', controller.updateFaq);
router.delete('/:slug/:section/delete/:index', controller.deleteFaq);

module.exports = router;