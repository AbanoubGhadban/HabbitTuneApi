const config = require('config');
const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);
const {sliceArray} = require('./utils');

const getDateOnly = (year, month, date) => {
  return new DateOnly(new Date(year, month, date));
}

const equalDates = (d1, d2) => {
  return (d1.year === d2.year && d1.month === d2.month && d1.date === d2.date);
}

const getKsaDate = () => {
  const ksaOffset = config.get('ksaOffset');
  const date = new Date();
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - ksaOffset);
  return getDateOnly(date.getFullYear(), date.getMonth(), date.getDate());
}

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const getDayName = (dateOnly) => {
  const date = new Date(dateOnly.year, dateOnly.month, dateOnly.date);
  return dayNames[date.getDay()];
}

const getDiffInDays = (date1, date2) => {
  date1 = new Date(date1.year, date1.month, date1.date);
  date2 = new Date(date2.year, date2.month, date2.date);
  const timestamp = date2 - date1;
  return Math.floor(timestamp/1000/60/60/24);
}

const getDaysAtLastWeek = (date1, date2) => {
  date1 = new Date(date1.year, date1.month, date1.date);
  date2 = new Date(date2.year, date2.month, date2.date);

  const daysDiff = date1.getDay() - date2.getDay();
  if (daysDiff === 1 || daysDiff === -6) {
    return [];
  }
  return sliceArray(dayNames, date1.getDay(), date2.getDay() + 1);
}

const getMinDate = (date1, date2) => {
  date1d = new Date(date1.year, date1.month, date1.date);
  date2d = new Date(date2.year, date2.month, date2.date);
  if (date1d < date2d) {
    return date1;
  }
  return date2;
}

const getMaxDate = (date1, date2) => {
  date1d = new Date(date1.year, date1.month, date1.date);
  date2d = new Date(date2.year, date2.month, date2.date);
  if (date1d > date2d) {
    return date1;
  }
  return date2;
}

module.exports = {
  getDateOnly,
  equalDates,
  getKsaDate,
  getDayName,
  getDiffInDays,
  getDaysAtLastWeek,
  getMaxDate,
  getMinDate
};
