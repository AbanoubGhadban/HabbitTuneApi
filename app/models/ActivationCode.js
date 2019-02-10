// Code used by user to activate his/her account
// Should be sent to user by sms

const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ActivationCode = sequelize.define('activation_code', {
    code: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    expIn: Sequelize.DATE
}, {
    timestamps: false
});

module.exports = ActivationCode;
