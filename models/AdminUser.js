const { knex } = require('../config/mysql');
const bcrypt = require('bcryptjs');

const AdminUser = {
    /**
     * Find a user by username
     * @param {string} username 
     * @returns {Promise<Object>}
     */
    findOne: async function ({ username }) {
        const user = await knex('admin_users').where({ username }).first();
        if (user) {
            // Add comparePassword method to the user object
            user.comparePassword = async function (candidatePassword) {
                return await bcrypt.compare(candidatePassword, this.password);
            };
        }
        return user;
    },

    /**
     * Create a new admin user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    create: async function (userData) {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const [id] = await knex('admin_users').insert({
            username: userData.username,
            password: passwordHash
        });
        return { id, ...userData };
    }
};

module.exports = AdminUser;