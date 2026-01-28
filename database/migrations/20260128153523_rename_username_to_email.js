/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('admin_users', function (table) {
        table.renameColumn('username', 'email');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('admin_users', function (table) {
        table.renameColumn('email', 'username');
    });
};
