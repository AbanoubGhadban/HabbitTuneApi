const mongoose = require('../utils/database');

const refreshTokenSchema = new mongoose.Schema({
    fcmToken: {
        type: String,
        required: false,
        index: true
    },
    lastSeen: {
        type: Date,
        required: false,
        index: true
    },
    expAt: {
        type: Date,
        required: false,
        index: true
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
