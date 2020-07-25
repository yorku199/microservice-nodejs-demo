'use strict';

const app = require('./config/app');

app.listen(process.env.PORT || 5010, function () {
    console.log('Start products service');
    console.log('Service is running');
});