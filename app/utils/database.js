const mongoose = require('mongoose');
const Fawn = require('fawn');
const config = require('config');

const getConnectionString = () => {
    const host = config.get('db.host');
    const port = config.get('db.port');
    const name = config.get('db.name');
    const user = config.get('db.user');
    const password = config.get('db.password');

    const userString = user? (password? `${user}:${password}@` : `${user}@`) : '';
    const hostString = port? `${host}:${port}` : host;
    //mongodb+srv://resuite:pass@cluster0-u6gxb.mongodb.net/test?retryWrites=true
    return `mongodb://${userString}${hostString}/${name}`;
}

mongoose.connect(getConnectionString())
.then(() => {
    console.log('Connected to mongodb')
});
Fawn.init(mongoose);
module.exports = mongoose;
