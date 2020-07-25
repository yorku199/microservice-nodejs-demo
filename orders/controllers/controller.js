'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    Order = mongoose.model('orders'),
    _ = require('lodash');

const bcrypt = require('bcrypt')
const md5 = require('md5')
const jwt = require('jwt-simple')
const passport = require('passport')
const ExtractJwt = require('passport-jwt').ExtractJwt
const JwtStrategy = require('passport-jwt').Strategy
const axios = require('axios');
const async = require('async');

exports.getList = function (req, res) {
    var pageNo = parseInt(req.query.pageNo);
    var size = parseInt(req.query.size);
    var query = {};
    if (pageNo < 0 || pageNo === 0) {
        response = { "error": true, "message": "invalid page number, should start with 1" };
        return res.json(response);
    }
    query.skip = size * (pageNo - 1);
    query.limit = size;

    const stages = [
        { $sort: { created: -1 } },
        { $match: { delete_status: 0 } }
    ];

    Order.aggregate(stages, function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: err
            });
        } else {
            res.jsonp({
                status: 200,
                data: datas
            });
        };
    });
};

exports.create = async function (req, res) {
    var newOrder = new Order(req.body);
    
    newOrder.save(function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: err
                });
            } else {
                res.jsonp({
                    status: 200,
                    data: data
                });

            };
    });
};

const SECRET = "secretKey";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: SECRET
}

const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    console.log("Start Authorization app:username:" + payload.username + " token:" + payload.token_access);

    axios.post('http://localhost:5000/api/users/checklogin', {
        username: payload.username,
        token_access: payload.token_access
    }).then(result => {
        if (result.data.status == "Success") {
            done(null, true);
        } else {
            done(null, false);
        }
        //console.log(res.data);
    }).catch(function (error) {
        // handle error
        done(null, false);
        console.log(error);
    });

});

passport.use(jwtAuth);

exports.requireJWTAuth = passport.authenticate("jwt", { session: false });

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Order.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: err
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    const stages = [
        { $sort: { created: -1 } },
        { $match: { delete_status: 0 } },
        { $match: { _id: mongoose.Types.ObjectId(req.data._id) } }
    ];

    var jwt = req.headers.authorization;
    Order.aggregate(stages, function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: err
            });
        } else {
            var resData = datas[0];
            //console.log("****:"+ JSON.stringify(datas));
            axios.get('http://localhost:5000/api/users/' + resData.user_id, {
              headers : {
                Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': jwt,
              }
            }).then(result => {

                if (result.status == 200) {
                    //console.log("****:"+ JSON.stringify(result.data.data));

                    resData.customer_name = result.data.data[0].firstname + ' ' + result.data.data[0].lastname
                    var listorder = resData.order_list
                    var ArrData = []
                    async.eachSeries(listorder, function (row, next) {
                            

                        axios.get('http://localhost:5010/api/products/' + row.product_id, {
                            headers : {
                                Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                        'Authorization': jwt,
                            }
                        }).then(result => {
                                    var data = {
                                        "product_id": row.product_id,
                                        "product_number": row.product_number,
                                        "product_name": result.data.data[0].product_title,
                                        "qty": row.qty,
                                        "price": row.price,
                                        "discount": row.discount,
                                        "total": (row.qty*row.price) - row.discount
                                    }
                                    ArrData.push(data)
                                    next()
                            });
                    }, function () {
                        resData.order_list = ArrData
                        res.jsonp({
                            status: 200,
                            data: resData
                        });
                    });

                } else {
                    var data = {
                        status: "Error",
                        message: "Invalid data"
                    }
                    res.status(401).send(data)
                }
            })

        };
    });
};

exports.update = function (req, res) {
    var updOrder = _.extend(req.data, req.body);

    updOrder.updateby = req.user;
    updOrder.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: err
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });

        };
    });
};

exports.delete = function (req, res) {
    var id = req.data._id;
    Order.findByIdAndUpdate(id, { delete_status: 1 }
        , function (err, data) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: err
                });
            } else {
                res.jsonp({
                    status: 200,
                    data: data
                });

            }
        })
};