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
    const family = await Family.findById(familyId).populate('children').exec();

    const acheivedPoints = {sports: 0, health: 0, social: 0, bodybuilding: 0};
    const maxPoints = {sports: 0, health: 0, social: 0, bodybuilding: 0};

    const promises = [];
    for (const child of family.children) {
      promises.push(child.getProgress(fromDate, toDate))
    }
    const results = await Promise.all(promises);

    for (const result of results) {
      for (const categoryPoints of result.acheivedPoints) {
        acheivedPoints[categoryPoints.category] += categoryPoints.totalPoints;
      }
      for (const categoryPoints of result.maxPoints) {
        maxPoints[categoryPoints.category] += categoryPoints.totalPoints;
      }
    }

    res.send({
      acheivedPoints: acheivedPoints,
      maxPoints,
      family: family.toJSON(),
      fromDate: fromDate.valueOf(),
      toDate: toDate.valueOf()
    });
  }
}
