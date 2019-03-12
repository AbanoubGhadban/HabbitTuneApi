const mongoose = require('../utils/database');
const DateOnly = require('mongoose-dateonly')(mongoose);
const {
  getDaysAtLastWeek,
  getDiffInDays,
  getMaxDate,
  getMinDate
} = require('../utils/dates');
const {arrIntersection} = require('../utils/utils');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    min: 2,
    max: 255,
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
  hidden: {
    type: Boolean,
    required: false
  },
  category: {
    type: String,
    enum: ['sports', 'health', 'social', 'bodybuilding'],
    required: true
  },
  days: [{
    type: String,
    enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    // If days is null, then it available all days
    required: false
  }]
});

activitySchema.options.toJSON = {
  transform: function (doc, ret, options) {
    if (ret) {
      ret.id = ret._id;
      delete ret._id;
    }
    return ret;
  }
}

module.exports = mongoose.model('Activity', activitySchema);
