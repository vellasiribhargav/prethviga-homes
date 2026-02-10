const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const renderContactsPage = async (req, res) => {
    try {
        const contactsCollection = mongoose.connection.db.collection("contacts");
        const contacts = await contactsCollection.find({}).sort({ createdAt: -1 }).toArray();

        // Add index for frontend use and map _id to id for compatibility with the view
        const contactsWithIndex = contacts.map((contact, index) => ({
            ...contact,
            id: contact._id.toString(),
            index: index
        }));

        res.render('admin/contacts_list', {
            title: 'Contacts List',
            contacts: contactsWithIndex,
            activeLink: 'contacts',
            rowsPerPage: 5,
            rowsPerPageOptions: [5, 10]
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.render('admin/contacts_list', {
            title: 'Contacts List',
            contacts: [],
            activeLink: 'contacts',
            error: 'Failed to load contacts'
        });
    }
};

const createContact = async (req, res) => {
    try {
        const { name, address, phone, email } = req.body;
        const contactsCollection = mongoose.connection.db.collection("contacts");

        const existContact = await contactsCollection.findOne({
            $or: [{ email }, { phone }]
        });

        if (existContact) {
            return res.json({ success: false, message: 'User already exists' });
        }

        await contactsCollection.insertOne({
            name,
            address,
            phone,
            email,
            createdAt: new Date()
        });

        res.json({ success: true, message: 'Contact saved successfully' });
    } catch (error) {
        console.log(error, 'error in contact insert');
        res.json({ success: false, message: 'Server error' });
    }
};

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contactsCollection = mongoose.connection.db.collection("contacts");

        const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
            res.json({ success: true, message: 'Contact deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    renderContactsPage,
    createContact,
    deleteContact
};