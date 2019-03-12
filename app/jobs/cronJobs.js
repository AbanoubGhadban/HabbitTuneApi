const cron = require("node-cron");
const dispatcher = require('./dispatcher');
const StoreActivitiesHistory = require('./StoreActivitiesHistory');

let scheduled = false;
const schedule = () => {
  if (scheduled) {
    return;
  }

  cron.schedule("0 * * * *", function() {
    dispatcher(new StoreActivitiesHistory());
  });
}

module.exports = schedule;
