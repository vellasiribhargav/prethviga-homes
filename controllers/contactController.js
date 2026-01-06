const { exist } = require("joi");
const {knex:db} = require("../config/mysql");

class contactFunction {
    async createContact(req, res) {
        try {
            const { name, address, phone, email } = req.body;
            
            if (!name || !email) {
            return res.json({ success: false, message: 'Name and email required' });
            }

            const existContact = await db('contact').where("email", email).orWhere("phone", phone).first();
            if (existContact) {
                return res.json({ success: false, message: 'User is already exists' });
            }
            
            await db('contact').insert({ name, address, phone, email });
            
            res.json({ success: true, message: 'Contact saved successfully' });
        } catch (error) {
            console.log(error,'error in contact insert');
            res.json({ success: false, message: 'Server error' });
        }
    }
}

module.exports = new contactFunction();