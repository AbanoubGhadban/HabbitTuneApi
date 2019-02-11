// Code used by child to login
// Should be displayed as QR Code

const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ActivationCode = sequelize.define('child_login_code', {
    code: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    expAt: Sequelize.DATE
}, {
    timestamps: false
});

module.exports = ActivationCode;