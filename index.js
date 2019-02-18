require('./app/utils/errorHandling');
require('express-async-errors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');

const errorMiddleware = require('./app/middleware/error');
const errTransformer = require('./app/middleware/errorTransform');
require('./app/utils/database');

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', require('./app/routes/auth'));
app.use('/families', require('./app/routes/families'));
app.use('/families', require('./app/routes/familyChildren'));
app.use('/users', require('./app/routes/users'));
app.use('/users', require('./app/routes/userFamilies'));

app.use(errTransformer);
app.use(errorMiddleware);

const port = config.get('server.port');
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
