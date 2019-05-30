const Activity = require('../models/Activity');
const ActivityHistory = require('../models/ActivityHistory');
const DateOnly = require('../utils/DateOnly');

class StoreActivitiesHistory {
  async run() {
    const maxHistory = await ActivityHistory.find({}).sort({date: -1}).findOne().exec();
    const historyDate = maxHistory && maxHistory.date? new DateOnly(+maxHistory.date) : new DateOnly(20190301);
    historyDate.setDate(historyDate.getDate() + 1);

    const today = new DateOnly();
    const startDate = historyDate < today? historyDate : today;
    const endDate = new DateOnly();

    await ActivityHistory.deleteOne({date: today.valueOf()});
    while (startDate <= endDate) {
      const curDate = new DateOnly(startDate.date);
      let categoryPoints = await Activity.aggregate([
        { $match: { $or: [
          { days: curDate.getDayName() },
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
        { days: curDate.getDayName() },
        { days: [] },
        { days: null }
      ]}).select("_id, points");
      activities = activities.map(a => {
        totalPoints += a.points;
        return a._id;
      });

      const activityHistory = new ActivityHistory({
        date: curDate.valueOf(),
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
