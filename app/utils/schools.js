const config = require('config');
const DateOnly = require('./DateOnly');

const startDate = DateOnly.fromNormalMonth(config.get('schools.startDate'));
const endDate = DateOnly.fromNormalMonth(config.get('schools.endDate'));

const weeklyHolidays = config.get('schools.weeklyHolidays');
const tmpOfficialHolidays = config.get('schools.officialHolidays');
const officialHolidays = {};
for (const dateInt of tmpOfficialHolidays) {
  officialHolidays[+DateOnly.fromNormalMonth(dateInt)] = true;
}

const canAttend = date => {
  const dateOnly = new DateOnly(date);
  if (dateOnly < startDate || dateOnly > endDate) {
    return false;
  }

  if (weeklyHolidays.contains(dateOnly.getDayName())) {
    return false;
  }

  if (officialHolidays[+date]) {
    return false;
  }
  return true;
}

module.exports = {
  canAttend
}
