const handler = (ex, event) => {
    console.log(`Faced ${event}`);
    console.log(ex);
    process.exit(1);
}

process.on('uncaughtException', ex => handler(ex, 'uncaughtException'));
process.on('unhandledRejection', ex => handler(ex, 'unhandledRejection'));
