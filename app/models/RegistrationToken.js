const mongoose = require('../utils/database');

const registrationTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        index: true,
        required: true,
        unique: true
    },
    expAt: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('RegistrationToken', registrationTokenSchema);
