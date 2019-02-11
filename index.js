require('./app/utils/errorHandling');
require('express-async-errors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');

const errorMiddleware = require('./app/middleware/error');
const errTransformer = require('./app/middleware/errorTransform');
const sequelize = require('./app/utils/database');
require('./app/models/Relationships');

const authRouter = require('./app/routes/auth');

app.use(bodyParser.json());

app.use('/auth', authRouter);

app.use(errTransformer);
app.use(errorMiddleware);

sequelize.sync()
.then(result => {
    console.log('Synced with DB');
    const port = config.get('server.port');
    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
}).catch(err => {
    console.log('Failed to Sync with DB');
    throw err;
});


