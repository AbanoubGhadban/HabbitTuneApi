const Activity = require('../models/Activity');
const ActivityHistory = require('../models/ActivityHistory');
const {
  getDayName,
  getDateOnly
} = require('../utils/dates');
const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);

class StoreActivitiesHistory {
  async run() {
    const startDate = new Date(2019, 2, 1);
    const endDate = new Date(2019, 3, 1);

    await ActivityHistory.deleteMany({});
    while (startDate <= endDate) {
      const curDate = new DateOnly(startDate);
      let categoryPoints = await Activity.aggregate([
        { $match: { $or: [
          { days: getDayName(curDate) },
          { days: [] },
          { days: null }
        ]}},
        { $group: {
          "_id": "$category",
          "points": { $sum: "$points" }
        }}
      ]);
      categoryPoints = categoryPoints.map(cp => ({
        category: cp._id,
        points: cp.points
      }));

      let totalPoints = 0;
      let activities = await Activity.find({ $or: [
        { days: getDayName(curDate) },
        { days: [] },
        { days: null }
      ]}).select("_id, points");
      activities = activities.map(a => {
        totalPoints += a.points;
        return a._id;
      });

      const activityHistory = new ActivityHistory({
        date: curDate,
        totalPoints,
        activities,
        points: categoryPoints
      });
      await activityHistory.save();
      startDate.setDate(startDate.getDate() + 1);
    }
  }
}

module.exports = StoreActivitiesHistory;
