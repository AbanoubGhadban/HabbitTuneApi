const mongoose = require('../utils/database');
const DateOnly = require('mongoose-dateonly')(mongoose);

const dayActivitySchema = new mongoose.Schema({
  date: {
    type: DateOnly,
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  family: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Can be null if user is deleted
    required: false
  },
  totalPoints: {
    type: Number,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  activities: [{
    _id: false,
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      required: true
    },
    points: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    category: {
      type: String,
      enum: ['sports', 'health', 'social', 'bodybuilding'],
      required: true
    }
  }]
});
dayActivitySchema.index({child: 1, date: 1}, {unique: true});

dayActivitySchema.options.toJSON = {
  transform: function (doc, ret, options) {
    if (ret) {
      ret.id = ret._id;
      ret.date = {
        day: doc.date.date,
        month: doc.date.month + 1,
        year: doc.date.year
      };
      delete ret.date;
      delete ret._id;
    }
    return ret;
  }
}

module.exports = mongoose.model('DayActivity', dayActivitySchema);
