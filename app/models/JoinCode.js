const mongoose = require('../utils/database');

const joinCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        min: 4,
        max: 255,
        unique: true,
        index: true
    },
    family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    },
    expAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('JoinCode', joinCodeSchema);
