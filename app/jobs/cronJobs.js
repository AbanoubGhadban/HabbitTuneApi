const cron = require("node-cron");
const dispatcher = require('./dispatcher');
const StoreActivitiesHistory = require('./StoreActivitiesHistory');
const NotifyDailyChildAbsence = require('./NotifyDailyChildAbsence');
const config = require('config');

let scheduled = false;
const schedule = () => {
  if (scheduled) {
    return;
  }

  cron.schedule("0 * * * *", function() {
    dispatcher(new StoreActivitiesHistory());
  });

  const optimalArrivalHour = config.get('schools.optimalArrivalTime.hour');
  const optimalArrivalMinute = config.get('schools.optimalArrivalTime.minute');
  cron.schedule(`${optimalArrivalMinute} ${optimalArrivalHour} * * *`, function() {
    dispatcher(new NotifyDailyChildAbsence());
  }, {
    scheduled: true,
    timezone: "Asia/Riyadh"
  });
}

module.exports = schedule;
