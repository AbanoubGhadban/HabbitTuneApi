const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const RefreshToken = sequelize.define('refresh_token', {
    refreshToken: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    accessToken: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false
    },
    expAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = RefreshToken;
