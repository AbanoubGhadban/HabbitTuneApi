// Stores FCM (Firebase Cloud Messaging) tokens

const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const RegistrationToken = sequelize.define('registration_token', {
    token: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
    },
    clientId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    },
    clientType: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = RegistrationToken;
