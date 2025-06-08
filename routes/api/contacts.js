const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const contactController = require('../../api/contactController');

// @route   GET api/contacts
// @desc    Get all contacts
// @access  Private
router.get('/', auth, contactController.getContacts);

// @route   POST api/contacts
// @desc    Add new contact
// @access  Private
router.post('/', [auth, contactController.validateContact], contactController.addContact);

// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', [auth, contactController.validateContact], contactController.updateContact);

// @route   DELETE api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', auth, contactController.deleteContact);

// @route   GET api/contacts/search
// @desc    Search contacts by email
// @access  Private
router.get('/search', auth, contactController.searchContacts);

module.exports = router; 