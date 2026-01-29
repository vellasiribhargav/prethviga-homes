const { knex: db } = require("../../config/mysql");

const renderContactsPage = async (req, res) => {
    try {
        const contacts = await db('contact').select('*').orderBy('id', 'desc');

        // Add index for frontend use if needed, though ID is usually sufficient
        const contactsWithIndex = contacts.map((contact, index) => ({
            ...contact,
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

const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db('contact').where('id', id).del();

        if (result) {
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
    deleteContact
};
