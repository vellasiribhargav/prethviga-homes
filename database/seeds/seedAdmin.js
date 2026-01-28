const { knex } = require('../../config/mysql');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Seeding admin user...');

        // Check if admin already exists
        const existingAdmin = await knex('admin_users').where({ username: 'admin@gmail.com' }).first();

        if (existingAdmin) {
            console.log('Admin user already exists. Skipping...');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash('admin@321', 10);

        await knex('admin_users').insert({
            username: 'admin@gmail.com',
            password: passwordHash
        });

        console.log('Admin user seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
}

seed();