'use strict';
var controller = require('../controllers/controller');

module.exports = function (app) {

    app.route('/api/products')
        .get(controller.requireJWTAuth, controller.getList)
        .post(controller.requireJWTAuth, controller.create);

    app.route('/api/products/:productId')
        .get(controller.requireJWTAuth, controller.read)
        .put(controller.requireJWTAuth, controller.update)
        .delete(controller.requireJWTAuth, controller.delete);

    app.param('productId', controller.getByID);

}