const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    role: {
        type: Sequelize.ENUM,
        values: ['father', 'mother'],
        allowNull: false
    },
    group: {
        type: Sequelize.ENUM,
        values: ['blocked', 'pending', 'normal', 'admin'],
        defaultValue: 'pending'
    }
});

const getMethod = User.prototype.get;
User.prototype.get = function(args) {
    const get = getMethod.bind(this);
    const values = get(args);
    if (values && values.password) {
        delete values.password;
    }
    return values;
}

User.prototype.toJson = function(args) {
    const values = this.get(args);
    delete values.password;
    return values;
}

module.exports = User;
