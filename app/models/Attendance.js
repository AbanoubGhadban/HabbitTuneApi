const mongoose = require('../utils/database');
const mongoosePaginate = require('mongoose-paginate-v2');
const DateOnlyType = require('mongoose-dateonly')(mongoose);

const attendanceSchema = new mongoose.Schema({
    _id: false,
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: true
    },
    fullName: {
      type: String,
      min: 6,
      max: 255,
      required: true
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
      required: true
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
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Family',
      required: true
    },
    attendance: {
      type: [{
        _id: false,
        date: {
          type: DateOnlyType,
          index: true,
          required: true
        },
        arriveTime: {
          type: Date,
          required: true,
          index: true,
          default: () => new Date()
        }
      }],
      select: false
    }
});

attendanceSchema.plugin(mongoosePaginate);

attendanceSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        if (ret) {
          const attendance = ret.attendance;
          if (Array.isArray(attendance)) {
            const att = attendance[0];
            att.arriveTime = !!att.arriveTime? +att.arriveTime : att.arriveTime;
            ret = {
              ...ret,
              ...att
            };
          }

          ret.id = ret._id;
          delete ret._id;
          delete ret.isVerified;
          delete ret.isDeleted;
          delete ret.attendance;
          delete ret.__v;
        }
        return ret;
    }
}

module.exports = mongoose.model('Attendance', attendanceSchema);
