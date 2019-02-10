// This code is used to allow other parent to join the family

const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const JoinCode = sequelize.define('join_code', {
    code: {
        type: Sequelize.STRING(100),
        primaryKey: true
    },
    expIn: Sequelize.DATE
}, {
    timestamps: false
});

module.exports = JoinCode;

