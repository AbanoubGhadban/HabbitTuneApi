const mongoose = require('../utils/database');
const mongoosePaginate = require('mongoose-paginate-v2');
const {schoolStorage} = require('../utils/storage');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    arriveTime: {
      type: Date,
      required: true
    },
    photo: {
        type: String,
        max: 30,
        required: false
    }
});

schoolSchema.plugin(mongoosePaginate);

schoolSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
            ret.id = ret._id;
            ret.thumbnail = ret.photo? schoolStorage.getThumbUrl(ret.photo) : null;
            ret.photo = ret.photo? schoolStorage.getFileUrl(ret.photo) : null;

            if (ret.arriveTime instanceof Date) {
              ret.arriveTime = +ret.arriveTime;
            }
            delete ret._id;
        }
        return ret;
    }
}

module.exports = mongoose.model('School', schoolSchema);
