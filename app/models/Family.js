const mongoose = require('../utils/database');
const User = require('./User');

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
    }]
});

familySchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.joinCodes;
        }
        return ret;
    }
}

familySchema.methods.hasParent = function (parentId) {
    const {parent1, parent2} = this;
    // Parent1, Parent2 may by populated or not
    return (
        (parent1 instanceof mongoose.Types.ObjectId && parent1.equals(parentId)) ||
        (parent2 instanceof mongoose.Types.ObjectId && parent1.equals(parent2)) ||
        (parent1 instanceof User && parent1._id.equals(parentId)) ||
        (parent2 instanceof User && parent2._id.equals(parentId))
    );
}

module.exports = mongoose.model('Family', familySchema);
