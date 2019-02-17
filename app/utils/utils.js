const crypto = require('crypto');

const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

const timeAfter = seconds => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return date;
}

const isParent = user => (user.role === 'father' || user.role === 'mother');

const parseInt = (value, defaultValue = 0, allowNegative = true) => {
    const type = typeof(value);
    if (type !== 'string' && type !== 'number') {
        return defaultValue;
    }

    value = +value;
    if (!Number.isInteger(value)) {
        return defaultValue;
    }
    if (!allowNegative && value < 0) {
        return defaultValue;
    }
    return value;
}

const delay = duration => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

module.exports = {
    sha256,
    timeAfter,
    isParent,
    parseInt,
    delay
}
