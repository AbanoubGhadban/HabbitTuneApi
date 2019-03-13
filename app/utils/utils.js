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

const sliceArray = (arr, from, to) => {
    const max = to > from? to : arr.length;
    let newArr = arr.slice(from, max);
    if (to <= from) {
        newArr = newArr.concat(arr.slice(0, to));
    }
    return newArr;
}

const arrIntersection = (arr1, arr2) => {
    return arr1.filter(item => arr2.includes(item));
}

const getBetweenQuery = (min, max) => {
    const q = {};
    let flag = false;
    if (typeof(min) === 'number' || min) {
        min = +min;
        if (!Number.isNaN(min)) {
            q.$gte = min;
            flag = true;
        }
    }
    if (typeof(max) === 'number' || max) {
        max = +max;
        if (!Number.isNaN(max)) {
            q.$lte = max;
            flag = true;
        }
    }
    
    if (flag) {
        return q;
    }
    return null;
}

module.exports = {
    sha256,
    timeAfter,
    isParent,
    parseInt,
    delay,
    sliceArray,
    getBetweenQuery,
    arrIntersection
}
