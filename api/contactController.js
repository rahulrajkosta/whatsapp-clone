const Contact = require('../models/Contact');
const User = require('../models/User');
const { validationResult, check } = require('express-validator');

// Validation middleware
exports.validateContact = [
    check('name', 'Name is required').not().isEmpty(),
    check('phone', 'Please include a valid phone number').not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail()
];

// @desc    Get all contacts for a user
// @route   GET /api/contacts
// @access  Private
exports.getContacts = async (req, res) => {
    try {
        // Get current user's email
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get saved contacts
        const savedContacts = await Contact.find({ user: req.user.id }).sort({ name: 1 });

        // Get users with matching emails from saved contacts
        const savedContactEmails = savedContacts.map(contact => contact.email);
        const potentialContacts = await User.find({
            email: { $in: savedContactEmails },
            _id: { $ne: req.user.id }
        }).select('-password');

        // Format the response
        const contacts = [
            ...savedContacts.map(contact => ({
                ...contact.toObject(),
                isSaved: true,
                // Find matching user details
                ...potentialContacts.find(user => user.email === contact.email)?.toObject() || {}
            }))
        ];

        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add new contact
// @route   POST /api/contacts
// @access  Private
exports.addContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email } = req.body;

    try {
        // Check if contact already exists for this user
        let contact = await Contact.findOne({ 
            user: req.user.id,
            email: email 
        });

        let findUser = await User.findOne({
            email: email
        });

        if (contact) {
            return res.status(400).json({ msg: 'Contact already exists' });
        }

        if (!findUser) {
            return res.status(400).json({msg: "User does not exist please use a registered email to create contact"});
        }

        contact = new Contact({
            user: req.user.id,
            name,
            phone,
            email
        });

        await contact.save();
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, email } = req.body;

    // Build contact object
    const contactFields = {};
    if (name) contactFields.name = name;
    if (phone) contactFields.phone = phone;
    if (email) contactFields.email = email;

    try {
        let contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ msg: 'Contact not found' });
        }

        // Make sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { $set: contactFields },
            { new: true }
        );

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ msg: 'Contact not found' });
        }

        // Make sure user owns contact
        if (contact.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Contact.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Contact removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Search contacts by email
// @route   GET /api/contacts/search
// @access  Private
exports.searchContacts = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ msg: 'Email query parameter is required' });
        }

        // Search for users with matching email
        const users = await User.find({
            email: { $regex: email, $options: 'i' },
            _id: { $ne: req.user.id }
        }).select('-password');

        // Get saved contacts to check which users are already contacts
        const savedContacts = await Contact.find({ 
            user: req.user.id,
            email: { $in: users.map(user => user.email) }
        });

        const savedEmails = savedContacts.map(contact => contact.email);

        // Format response
        const contacts = users.map(user => ({
            ...user.toObject(),
            isSaved: savedEmails.includes(user.email)
        }));

        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}; 