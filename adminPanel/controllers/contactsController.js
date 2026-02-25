const mongoose = require('mongoose');
const dayjs = require('dayjs');
const { ObjectId } = require("mongodb");
const { asyncHandler, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const { formatedDate } = require('../../utils/index');
const { ListFilter } = require('../utils/filterUtils');

const renderContactsPage = asyncHandler(async (req, res) => {
    let { search, fromDate, toDate, page = 1, limit = 5, is_filter = false } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const skip = (page - 1) * limit;

    const contactsCollection = mongoose.connection.db.collection("contacts");

    let query = {};
    const { query: filteredQuery, isFiltered } = ListFilter(query, req);

    const totalItems = await contactsCollection.countDocuments(filteredQuery);
    const totalPages = Math.ceil(totalItems / limit);
    const data = await contactsCollection.find(filteredQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    const contacts = data.map((contact, index) => ({
        ...contact,
        id: contact._id.toString(),
        index: skip + index,
        createdAt: formatedDate(contact.createdAt)
    }));

    const response = {
        title: 'Contacts List',
        contacts,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            start: skip + 1,
            end: Math.min(skip + limit, totalItems)
        },
        activeLink: 'contacts',
        rowsPerPage: limit,
        rowsPerPageOptions: [5, 10, 20],
        filters: { search, fromDate, toDate },
        is_filtered: isFiltered
    };

    if (is_filter) {
        return res.json({ success: true, ...response });
    }

    res.render('admin/contacts_list', response);
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
