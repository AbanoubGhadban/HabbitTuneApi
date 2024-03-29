const mongoose = require('../utils/database');

const loginCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        min: 4,
        max: 255,
        unique: true,
        index: true
    },
    child: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Child'
    },
    expAt: {
        type: Date,
        required: true
    }
});

loginCodeSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
            ret.id = ret._id;
            delete ret._id;
        }
        return ret;
    }
}

module.exports = mongoose.model('LoginCode', loginCodeSchema);
