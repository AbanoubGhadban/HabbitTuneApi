const winston = require('../utils/winston');

const handler = (ex, event) => {
    console.log(`Faced ${event}`);
    console.log(ex);

    try {
        winston.log('error', `Runtime Error ${event}`, {
            ...ex,
            location: __filename,
            time: new Date()
        });
    } catch (ex) {}

    process.exit(1);
}

process.on('uncaughtException', ex => handler(ex, 'uncaughtException'));
process.on('unhandledRejection', ex => handler(ex, 'unhandledRejection'));
