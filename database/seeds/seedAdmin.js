const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    try {
        console.log('Seeding admin user...');

        // Check if table exists
        const hasTable = await knex.schema.hasTable('admin_users');
        if (!hasTable) {
            console.log('ERROR: admin_users table does not exist!');
            return;
        }

        // Check if admin already exists
        const existingAdmin = await knex('admin_users').where({ email: 'admin@gmail.com' }).first();

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping...');
            return;
        }

        const passwordHash = await bcrypt.hash('admin@321', 10);

        await knex('admin_users').insert({
            email: 'admin@gmail.com',
            password: passwordHash
        });

        console.log('Admin user seeded successfully!');
    } catch (error) {
        console.log('Error seeding admin user MESSAGE:', error.message);
        console.error('Error FULL:', error);
    }
};