const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require("mongodb");
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');

const { formatDateShortSimple, formatDateForDisplay } = require('../../utils/index');

const renderContactsPage = asyncHandler(async (req, res) => {
    const contactsCollection = mongoose.connection.db.collection("contacts");
    const contacts = await contactsCollection.find({}).sort({ createdAt: -1 }).toArray();

    // Add index for frontend use and map _id to id for compatibility with the view
    const contactsWithIndex = contacts.map((contact, index) => ({
        ...contact,
        id: contact._id.toString(),
        index: index,
        createdAt: formatDateForDisplay(contact.createdAt, true)
    }));

    res.render('admin/contacts_list', {
        title: 'Contacts List',
        contacts: contactsWithIndex,
        activeLink: 'contacts',
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10]
    });
});

const createContact = asyncHandler(async (req, res) => {
    const { name, address, phone, email } = req.body;
    const contactsCollection = mongoose.connection.db.collection("contacts");

    const existContact = await contactsCollection.findOne({
        $or: [{ email }, { phone }]
    });

    if (existContact) {
        throw new ValidationError("User already exists");
    }

    await contactsCollection.insertOne({
        name,
        address,
        phone,
        email,
        createdAt: dayjs().toDate()
    });

    res.json({ success: true, message: 'Contact saved successfully' });
});

const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const contactsCollection = mongoose.connection.db.collection("contacts");

    if (!ObjectId.isValid(id)) {
        throw new ValidationError("Invalid ID");
    }

    const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
        throw new NotFoundError("Contact not found");
    }

    res.json({ success: true, message: 'Contact deleted successfully' });
});

module.exports = {
    renderContactsPage,
    createContact,
    deleteContact
};
