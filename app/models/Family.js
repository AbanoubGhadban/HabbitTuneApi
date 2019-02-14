const mongoose = require('../utils/database');
const Child = require('./Child');
const JoinCode = require('./JoinCode');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        required: true,
        default: 'active'
    },
    points: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    parent1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    parent2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child'
    }],
    joinCodes: [JoinCode.schema]
});

module.exports = mongoose.model('Family', familySchema);
