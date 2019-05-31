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

const optimalArrivalHour = config.get('schools.optimalArrivalTime.hour');
const optimalArrivalMinute = config.get('schools.optimalArrivalTime.minute');

const canAttend = date => {
  const dateOnly = new DateOnly(date);
  if (dateOnly < startDate || dateOnly > endDate) {
    return false;
  }

  if (weeklyHolidays.includes(dateOnly.getDayName())) {
    return false;
  }

  if (officialHolidays[+date]) {
    return false;
  }
  return true;
}

/**
 * @param {Date} arrivalTime
 */
const getArrivalStatus = arrivalTime => {
  const optimumArrivalTime = new Date(
    arrivalTime.getFullYear(), arrivalTime.getMonth(), arrivalTime.getDate(),
    optimalArrivalHour, optimalArrivalMinute);

  const diffInMillis = optimumArrivalTime - arrivalTime;
  const diffInMinutes = Math.floor(diffInMillis/1000/60);

  if (Math.abs(diffInMinutes) <= 5) {
    return "onTime";
  }

  if (diffInMinutes < 0) {
    return "late";
  }

  return "beforeTime";
}

module.exports = {
  canAttend,
  getArrivalStatus
}
