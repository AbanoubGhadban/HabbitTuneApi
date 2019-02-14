const crypto = require('crypto');

const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

const timeAfter = seconds => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return date;
}

const isParent = user => (user.role === 'father' || user.role === 'mother');

module.exports = {
    sha256,
    timeAfter,
    isParent
}
