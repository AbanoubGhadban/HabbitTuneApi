const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Family = sequelize.define('family', {
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM,
        values: ['active', 'blocked'],
        defaultValue: 'active'
    }
});

module.exports = Family;
