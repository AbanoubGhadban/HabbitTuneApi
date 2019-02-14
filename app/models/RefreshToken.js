const mongoose = require('../utils/database');

const refreshTokenSchema = new mongoose.Schema({
    expAt: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
