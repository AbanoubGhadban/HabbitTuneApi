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
  startDate: {
    type: DateOnly,
    required: true
  },
  endDate: {
    type: DateOnly,
    required: false
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

activitySchema.methods.calculatePoints = function(fromDate, toDate) {
  fromDate = getMaxDate(fromDate, this.startDate);
  toDate = this.endDate? getMinDate(toDate, this.endDate) : toDate;
  const weeksCount = Math.floor((getDiffInDays(fromDate, toDate) + 1)/7);
  const lastWeekDays = getDaysAtLastWeek(fromDate, toDate);
  if (!this.days || this.days.length === 0) {
    return (weeksCount * 7 + lastWeekDays.length) * this.points;
  }
  return (weeksCount * 7 + arrIntersection(this.days, lastWeekDays)) * this.points;
};

module.exports = mongoose.model('Activity', activitySchema);
