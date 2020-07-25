'use strict';

const app = require('./config/app');

app.listen(process.env.PORT || 5020, function () {
    console.log('Start orders service');
    console.log('Service is running');
});