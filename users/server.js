'use strict';

const app = require('./config/app');

app.listen(process.env.PORT || 5000, function () {
    console.log('Start users service');
    console.log('Service is running');
});