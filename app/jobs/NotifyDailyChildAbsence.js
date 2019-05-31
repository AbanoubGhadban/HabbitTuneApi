const dispatchJob = require('./dispatcher');
const NotifyChildAbsence = require('./NotifyChildAbsence');
const School = require('../models/School');
const DateOnly = require('../utils/DateOnly');
const {canAttend} = require('../utils/schools');

class NotifyDailyChildAbsence {
  async run() {
    const today = new DateOnly();
    if (!canAttend(today)) {
      return;
    }

    const schools = await School.find({}).select({_id: true}).exec();
    for (const {_id} of schools) {
      const job = new NotifyChildAbsence(_id, today);
      await dispatchJob(job);
    }
  }
}

module.exports = NotifyDailyChildAbsence;
