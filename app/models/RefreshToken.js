const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const RefreshToken = sequelize.define('refresh_token', {
    refreshToken: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    clientType: Sequelize.STRING(10),
    expAt: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    timestamps: false
});

module.exports = RefreshToken;
