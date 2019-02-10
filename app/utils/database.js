const Sequelize = require('sequelize');
const config = require('config');

const sequelize = new Sequelize(
    config.get('db.name'),
    config.get('db.user'),
    config.get('db.password'), {
        dialect: 'mysql',
        host: config.get('db.host')
    }
);

module.exports = sequelize;
