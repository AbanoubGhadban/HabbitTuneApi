const config = require('config');
const mongoose = require('./database');

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
class DateOnly {
  constructor(value) {
    let date = new Date();
    if (typeof(value) === 'number') {
      if (!Number.isInteger(value)) {
        throw new Error('Invalida Date');
      }
      value = value.toString();
    }
    if (typeof(value) === 'string') {
      if (value.length < 8 || Number.isNaN(+value)) {
        throw new Error('Invalida Date');
      }
      date.setFullYear(+value.substr(0, 4));
      date.setMonth(+value.substr(4, 2));
      date.setDate(+value.substr(6, 2));
    } else if (value instanceof Date) {
      date.setFullYear(value.getFullYear());
      date.setMonth(value.getMonth());
      date.setDate(value.getDate());
    } else if (value instanceof DateOnly) {
      date.setFullYear(value.getYear());
      date.setMonth(value.getMonth());
      date.setDate(value.getDate());
    } else {
      const ksaOffset = config.get('ksaOffset');
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - ksaOffset);
    }
    this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static fromObjectId(objectId) {
    if (objectId instanceof mongoose.Types.ObjectId) {
      objectId = objectId.toString();
    }

    if (typeof(objectId) !== 'string') {
      return null;
    }
    
    const timestamp = objectId.substr(0, 8);
    const date = new Date(parseInt(timestamp, 16) * 1000);
    const ksaOffset = config.get('ksaOffset');
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset() - ksaOffset);
    return new DateOnly(date);
  }

  getYear() {
    return this.date.getFullYear();
  }

  getMonth() {
    return this.date.getMonth();
  }

  getDate() {
    return this.date.getDate();
  }

  setYear(year) {
    this.date.setFullYear(year);
  }

  setMonth(month) {
    this.date.setMonth(month);
  }

  setDate(date) {
    this.date.setDate(date);
  }

  getDayName() {
    return dayNames[this.date.getDay()];
  }

  toString() {
    const strYear = this.date.getFullYear().toString().padStart(4, "0");
    const strMonth = this.date.getMonth().toString().padStart(2, "0");
    const strDate = this.date.getDate().toString().padStart(2, "0");
    return `${strYear}${strMonth}${strDate}`;
  }

  valueOf() {
    return +this.toString();
  }

  equals(otherDate) {
    return this.valueOf() === (new DateOnly(otherDate)).valueOf();
  }

  toLocalDate() {
    return this.date.toLocaleDateString()
  }
}

module.exports = DateOnly;
