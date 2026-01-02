// require('dotenv').config();
// const knex = require('knex');

// const db = knex({
//   client: process.env.DB_CONNECTION,
//   connection: {
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     charset: 'utf8',
//     timezone: 'UTC'
//   }
// });

// module.exports = {
//   knex: db,
// };


require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password:  process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    port:process.env.DB_PORT,
    logging : false,
    timezone: '+05:30',
    seederStorage: 'sequelize',
    seederStorageTableName: 'CustomSeederTable',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/prethviga-homes'
  }
};
