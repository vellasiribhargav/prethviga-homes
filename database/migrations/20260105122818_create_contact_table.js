/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('contact', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.string('phone').notNullable();
    table.string('email').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('contact');
};