const mongoose = require('../utils/database');
const DateOnly = require('mongoose-dateonly')(mongoose);
const {
  getDaysAtLastWeek,
  getDiffInDays,
  getMaxDate,
  getMinDate
} = require('../utils/dates');
const {arrIntersection} = require('../utils/utils');

const activityHistorySchema = new mongoose.Schema({
  date: {
    type: DateOnly,
    required: true,
    unique: true
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }],
  points: [{
    category: {
      type: String,
      enum: ['sports', 'health', 'social', 'bodybuilding'],
      required: true
    },
    points: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    }
  }]
});

activityHistorySchema.options.toJSON = {
  transform: function (doc, ret, options) {
    if (ret) {
      ret.id = ret._id;
      delete ret._id;
    }
    return ret;
  }
}

module.exports = mongoose.model('ActivityHistory', activityHistorySchema);
