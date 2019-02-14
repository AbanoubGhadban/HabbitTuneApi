const mongoose = require('mongoose');
const config = require('config');

const getConnectionString = () => {
    const host = config.get('db.host');
    const port = config.get('db.port');
    const name = config.get('db.name');
    const user = config.get('db.user');
    const password = config.get('db.password');

    const userString = user? (password? `${user}:${password}@` : `${user}@`) : '';
    const hostString = port? `${host}:${port}` : host;
    return `mongodb://${userString}${hostString}/${name}`;
}

mongoose.connect(getConnectionString())
.then(() => console.log('Connected to mongodb'));

module.exports = mongoose;
