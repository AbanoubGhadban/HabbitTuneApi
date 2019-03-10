const {
  getDayName,
  getKsaDate,
  getDiffInDays,
  getDateOnly
} = require('../utils/dates');
const DayActivity = require('../models/DayActivity');
const Activity = require('../models/Activity');
const Child = require('../models/Child');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');
const Fawn = require('fawn');
const mongoose = require('../utils/database');

module.exports = {
  show: async(req, res) => {
    const {date, childId} = req.params;
    
    const dayActivity = await DayActivity.findOne({
      child: childId, date
    }).populate('activities.activity').exec();

    if (!dayActivity) {
      throw new NotFoundError('DayActivity');
    }
    res.send(dayActivity.toJSON());
  },

  store: async(req, res) => {
    const {date, childId} = req.params;
    const child = await Child.findById(childId).exec();
    const today = getKsaDate();
    if (today.year !== date.year || today.month !== date.month || today.date !== date.date) {
      //throw ValidationError.from('date', date, types.ACTIVITY_DATE_PASSED);
    }

    let totalPoints = 0;
    let activityObjects = await Activity.find({
      _id: { $in: req.body.activities },
      startDate: { $lte: today },
      $or: [{ $endDate: null }, { $endDate: { $gt: today.valueOf() } }],
      $or: [ { days: getDayName(today) }, { days: null }, { days: [] }]
    }).exec();
    
    activityObjects = activityObjects.map(a => {
      totalPoints += a.points;
      return {
        activity: a._id,
        points: a.points,
        category: a.category
      };
    });

    const parent = await req.user();
    let dayActivity = new DayActivity({
      date,
      child: childId,
      family: child.family,
      parent: parent._id,
      totalPoints,
      activities: activityObjects
    });

    let incChildPoints = totalPoints;
    const prevActivities = await DayActivity.findOne({
      child: childId,
      date
    });

    // If parent submitted today activities before
    if (prevActivities) {
      incChildPoints -= prevActivities.totalPoints;
    }

    const task = new Fawn.Task();
    task.update('child', {_id: childId}, {
        $inc: {points: incChildPoints}
    });
    task.update('families', {_id: child.family.toString()}, {
        $inc: {points: incChildPoints}
    });

    if (prevActivities) {
      task.update('dayactivities', {
        child: new mongoose.Types.ObjectId(childId),
        date
      }, { $set: {
        date,
        child: new mongoose.Types.ObjectId(childId),
        family: child.family,
        parent: parent._id,
        totalPoints,
        activities: activityObjects
      }});
    } else {
      task.save(dayActivity);
    }

    await task.run({useMongoose: true});

    dayActivity = await DayActivity.findOne({
      child: childId,
      date
    }).populate('activities.activity').exec();

    res.send(dayActivity.toJSON());
  },

  getProgress: async(req, res) => {
    let {fromDate, toDate, childId} = req.params;
    
    const acheivedPoints = await DayActivity.aggregate([
      {$unwind: "$activities"},
      { $match: { date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() }, child: new mongoose.Types.ObjectId("5c6a89a5c779ac6f6d5e6561") } },
      { $group: { _id: "$activities.category", totalPoints: { $sum: "$activities.points" } } }
    ]).exec();

    const availableActivities = await Activity.find({
      startDate: { $lte: toDate.valueOf() }
    }).exec();

    const categoryPoints = {};
    for (const activity of availableActivities) {
      if (!categoryPoints[activity.category]) {
        categoryPoints[activity.category] = 0;
      }
      categoryPoints[activity.category] += activity.calculatePoints(fromDate, toDate);
    };

    res.send({
      acheivedPoints: acheivedPoints,
      maxPoints: categoryPoints,
      child: childId,
      fromDate,
      toDate
    });
  }
};