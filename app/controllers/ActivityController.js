const Family = require('../models/Family');
const Activity = require('../models/Activity');
const ValidationError = require('../errors/ValidationError');
const errors = require('../errors/types');
const ForbiddenError = require('../errors/ForbiddenError');

const {
  getDayName
} = require('../utils/dates');

module.exports = {
    index: async(req, res) => {
        const {date} = req.params;
        let activities;
        if (date) {
          activities = await Activity.find({ $or: [
            { days: date.getDayName() },
            { days: null },
            { days: [] }
          ]}).exec();
        } else {
          activities = await Activity.find({}).exec();
        }
        
        activities = activities.map(a => a.toJSON());
        res.send(activities);
    }
}
