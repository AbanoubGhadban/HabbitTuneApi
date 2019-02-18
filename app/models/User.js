const mongoose = require('../utils/database');
const RefreshToken = require('./RefreshToken');
const RegistrationToken = require('./RegistrationToken');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    families: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    }],
    activationCodes: {
        type: [{
            _id: false,
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

userSchema.plugin(mongoosePaginate);

userSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.activationCodes;
            delete ret.registrationTokens;
            delete ret.refreshTokens;
        }
        return ret;
    }
}

module.exports = mongoose.model('User', userSchema);
