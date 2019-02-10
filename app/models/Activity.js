const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Activity = sequelize.define('activity', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING(1000),
        allowNull: true
    },
    category: {
        type: Sequelize.ENUM,
        values: ['sports', 'health', 'social', 'bodybuilding']
    },
    expAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
});

module.exports = Activity;
