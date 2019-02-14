const mongoose = require('../utils/database');
const RefreshToken = require('./RefreshToken');
const RegistrationToken = require('./RegistrationToken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    phone: {
        type: String,
        min: 5,
        max: 100,
        required: true,
        unique: true
    },
    password: {
        type: String,
        max: 255,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['father', 'mother'],
        required: true
    },
    group: {
        type: String,
        enum: ['blocked', 'pending', 'normal', 'admin'],
        default: 'pending',
        required: true
    },
    activationCodes: {
        type: [{
            code: {
                type: String,
                index: true,
                required: true
            },
            expAt: {
                type: Date,
                required: true
            }
        }],
        select: false
    },
    registrationTokens: {
        type: [RegistrationToken.schema],
        select: false
    },
    refreshTokens: {
        type: [RefreshToken.schema],
        select: false
    }
});

module.exports = mongoose.model('User', userSchema);
