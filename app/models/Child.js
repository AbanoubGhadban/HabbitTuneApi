const mongoose = require('../utils/database');
const RefreshToken = require('./RefreshToken');
const RegistrationToken = require('./RegistrationToken');
const mongoosePaginate = require('mongoose-paginate-v2');

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    },
    role: {
        type: String,
        enum: ['son', 'daughter'],
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        },
        index: true
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

childSchema.plugin(mongoosePaginate);

childSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.registrationTokens;
            delete ret.refreshTokens;
        }
        return ret;
    }
}

module.exports = mongoose.model('Child', childSchema);
