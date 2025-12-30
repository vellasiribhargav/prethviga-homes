const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost', // Redis server host
  port: 6379,        // Redis server port
  // Other configuration options
});

module.exports = Redis;