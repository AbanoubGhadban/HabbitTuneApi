const winston = require('../utils/winston');

const dispatchJob = async (job) => {
  try {
    console.log(`Dispatching ${job.constructor.name}...`);
    winston.log('info', `Dispatching ${job.constructor.name}...`, {time: new Date()});

    await job.run();

    console.log(`${job.constructor.name} dispatched successfully`);
    winston.log('info', `${job.constructor.name} dispatched successfully`, {time: new Date()});
  } catch (err) {
    console.log(`Error Occured at Job ${job.constructor.name}\n`, err);
    try {
        winston.log('error', `Error Occured at Job ${job.constructor.name}`, {
            ...ex,
            location: __filename,
            time: new Date()
        });
    } catch (ex) {}
  }
}

module.exports = dispatchJob;
