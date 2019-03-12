const dispatchJob = async (job) => {
  try {
    console.log(`Dispatching ${job.constructor.name}...`);
    await job.run();
    console.log(`${job.constructor.name} dispatched successfully`);
  } catch (err) {
    console.log(`Error Occured at Job ${job.constructor.name}\n${err}`);
  }
}

module.exports = dispatchJob;
