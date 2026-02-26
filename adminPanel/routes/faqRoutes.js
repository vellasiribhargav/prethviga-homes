const express = require('express');
const router = express.Router();
const controller = require('../controllers/faqController');

router.get('/', controller.renderFaqMainPage);
router.get('/list', controller.getFaqsList);
router.get('/get', controller.getFaqs);
router.post('/add', controller.addFaqs);
router.put('/update/:id', controller.updateFaq);
router.delete('/delete/:id', controller.deleteFaq);

router.get('/:slug/:section/list', controller.getFaqsList);
router.get('/:slug/:section/get', controller.getFaqs);
router.post('/:slug/:section/add', controller.addFaqs);
router.put('/:slug/:section/update/:id', controller.updateFaq);
router.delete('/:slug/:section/delete/:id', controller.deleteFaq);

module.exports = router;