'use strict';
var controller = require('../controllers/controller');

module.exports = function (app) {

    app.route('/api/orders')
        .get(controller.requireJWTAuth, controller.getList)
        .post(controller.requireJWTAuth, controller.create);

    app.route('/api/orders/:orderId')
        .get(controller.requireJWTAuth, controller.read)
        .put(controller.requireJWTAuth, controller.update)
        .delete(controller.requireJWTAuth, controller.delete);

    app.param('orderId', controller.getByID);

}