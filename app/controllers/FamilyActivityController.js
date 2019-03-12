const {
  getDayName,
  getKsaDate,
  equalDates,
  getDiffInDays,
  getDateOnly
} = require('../utils/dates');
const DayActivity = require('../models/DayActivity');
const ActivityHistory = require('../models/ActivityHistory');
const Activity = require('../models/Activity');
const Family = require('../models/Family');
const Child = require('../models/Child');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const types = require('../errors/types');
const Fawn = require('fawn');
const mongoose = require('../utils/database');

module.exports = {
  getProgress: async(req, res) => {
    const {familyId, fromDate, toDate} = req.params;
    const family = await Family.findById(familyId).exec();

    const childrenCount = family.children.length;
    const acheivedPoints = await DayActivity.aggregate([
      { $unwind: "$activities" },
      { $match: {
        date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() },
        family: new mongoose.Types.ObjectId(familyId)
      }},
      { $group: {
        _id: "$activities.category",
        totalPoints: { $sum: "$activities.points" }
      }},
      { $project: { _id: 0, category: "$_id", totalPoints: 1 } }
    ]).exec();

    let maxPoints = await ActivityHistory.aggregate([
      { $unwind: "$points" },
      { $match: { date: { $gte: fromDate.valueOf(), $lte: toDate.valueOf() } } },
      { $group: {
        _id: "$points.category",
        totalPoints: { $sum: "$points.points" }
      }},
      { $project: {
        _id: 0,
        category: "$_id",
        totalPoints: { $multiply: [ "$totalPoints", childrenCount ] }
      }}
    ]);

    res.send({
      acheivedPoints: acheivedPoints,
      maxPoints,
      family: familyId,
      fromDate: fromDate.valueOf(),
      toDate: toDate.valueOf()
    });
  }
}
