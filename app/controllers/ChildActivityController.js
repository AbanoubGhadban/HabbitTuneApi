const DateOnly = require('../utils/DateOnly');
const DayActivity = require('../models/DayActivity');
const ActivityHistory = require('../models/ActivityHistory');
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
    const child = await Child.findById(childId).exec();
    
    const dayActivity = await DayActivity.findOne({
      child: childId,
      date: date.valueOf()
    }).exec();

    let allActivities = [];
    let activityHistory = null;
    const today = new DateOnly();
    if (today.equals(date) ||
        !(activityHistory = await ActivityHistory.findOne({ date: date.valueOf() }).populate('activities').exec())) {
      allActivities = await Activity.find({ $or: [
        { days: today.getDayName() },
        { days: null },
        { days: [] }
      ], hidden: { $ne: true }}).exec();
      allActivities = allActivities.map(a => a.toJSON());
    } else {
      allActivities = activityHistory.toJSON().activities;
    }
    
    res.send({
      date: date.valueOf(),
      child: childId,
      progress: await child.getProgress(null, date),
      dayActivity: dayActivity? dayActivity.toJSON() : null,
      allActivities
    });
  },

  store: async(req, res) => {
    const {date, childId} = req.params;
    const child = await Child.findById(childId).exec();
    const today = new DateOnly();
    if (!today.equals(date)) {
      //throw ValidationError.from('date', date, types.ACTIVITY_DATE_PASSED);
    }

    let totalPoints = 0;
    let activityObjects = await Activity.find({
      _id: { $in: req.body.activities },
      $or: [ { days: today.getDayName() }, { days: null }, { days: [] }],
      hidden: { $ne: true }
    }).exec();
    
    activityObjects = activityObjects.map(a => {
      totalPoints += a.points;
      return {
        _id: a._id,
        name: a.name,
        points: a.points,
        category: a.category
      };
    });

    const parent = await req.user();
    let dayActivity = new DayActivity({
      date: date.valueOf(),
      child: childId,
      family: child.family,
      parent: parent._id,
      totalPoints,
      activities: activityObjects
    });

    let incChildPoints = totalPoints;
    const prevActivities = await DayActivity.findOne({
      child: childId,
      date: date.valueOf()
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
        date: date.valueOf()
      }, { $set: {
        date: date.valueOf(),
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
    await module.exports.show(req, res);
  },

  getProgress: async(req, res) => {
    let {fromDate, toDate, childId} = req.params;
    const child = await Child.findById(childId);

    res.send(await child.getProgress(fromDate, toDate));
  }
};
