require('./app/utils/errorHandling');
require('express-async-errors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const delay = require('./app/middleware/delay');
const config = require('config');
require('./app/utils/firebase');

const errorMiddleware = require('./app/middleware/error');
const errTransformer = require('./app/middleware/errorTransform');
const mongoose = require('./app/utils/database');
const {fileUpload} = require('./app/middleware/imageUpload');

// app.use(delay(300));
app.use(cors());
app.use(fileUpload);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/imgs', express.static('imgs'));
app.use('/sheets', express.static('sheets'));

app.use('/auth', require('./app/routes/auth'));
app.use('/families', require('./app/routes/families'));
app.use('/families', require('./app/routes/familyChildren'));
app.use('/families', require('./app/routes/familyActivities'));
app.use('/users', require('./app/routes/users'));
app.use('/users', require('./app/routes/userFamilies'));
app.use('/children', require('./app/routes/children'));
app.use('/children', require('./app/routes/childActivities'));
app.use('/activities', require('./app/routes/activities'));
app.use('/attendance', require('./app/routes/attendance'));
app.use('/schools', require('./app/routes/schoolStudents'));
app.use('/schools', require('./app/routes/schools'));

app.use(errTransformer);
app.use(errorMiddleware);

mongoose.connection.addListener('connected', async () => {
    const dispatchJob = require('./app/jobs/dispatcher');
    const schedule = require('./app/jobs/cronJobs');
    const StoreActivitiesHistory = require('./app/jobs/StoreActivitiesHistory');
    await dispatchJob(new StoreActivitiesHistory());
    schedule();

    const port = config.get('server.port');
    app.listen(port, () => {
        console.log(`Listening on ${port}`);
    });
})
