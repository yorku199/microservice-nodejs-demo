'use strict';
var controller = require('../controllers/controller');

module.exports = function (app) {

    app.route('/api/users')
        .get(controller.requireJWTAuth, controller.getList)
        .post(controller.requireJWTAuth, controller.create);

    app.route('/api/users/:userId')
        .get(controller.requireJWTAuth, controller.read)
        .put(controller.requireJWTAuth, controller.update)
        .delete(controller.requireJWTAuth, controller.delete);

    app.route('/api/users/login/')
        .post(controller.login);

    app.route('/api/users/checklogin/')
        .post(controller.checklogin);
        
    app.param('userId', controller.getByID);

}