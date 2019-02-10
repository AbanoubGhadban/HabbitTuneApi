const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Child = sequelize.define('child', {
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM,
        values: ['son', 'daughter'],
        allowNull: false
    },
    points: {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
    }
});

module.exports = Child;
