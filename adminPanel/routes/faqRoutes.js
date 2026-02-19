const express = require('express');
const router = express.Router();
const controller = require('../controllers/faqController');

router.get('/', controller.renderFaqMainPage);
router.get('/:slug/:section/list', controller.getFaqsList);
router.get('/:slug/:section/get', controller.getFaqs);
router.post('/:slug/:section/add', controller.addFaqs);
// Update FAQ
router.put('/:slug/:section/update/:id', controller.updateFaq);
// Delete FAQ
router.delete('/:slug/:section/delete/:id', controller.deleteFaq);

module.exports = router;