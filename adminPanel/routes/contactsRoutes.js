const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

router.get('/list', contactsController.renderContactsPage);
router.delete('/delete/:id', contactsController.deleteContact);
router.post('/create-contact', contactsController.createContact);

module.exports = router;