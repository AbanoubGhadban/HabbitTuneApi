// Configration file for sequelize migration

const config = require('config');

module.exports = {
  development: {
    username: config.get('db.user'),
    password: config.get('db.password'),
    database: config.get('db.name'),
    host: config.get('db.host'),
    dialect: 'mysql'
  },
  test: {
    username: config.get('db.user'),
    password: config.get('db.password'),
    database: config.get('db.name'),
    host: config.get('db.host'),
    dialect: 'mysql'
  },
  production: {
    username: config.get('db.user'),
    password: config.get('db.password'),
    database: config.get('db.name'),
    host: config.get('db.host'),
    dialect: 'mysql'
  }
};