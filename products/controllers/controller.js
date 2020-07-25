'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    Product = mongoose.model('products'),
    _ = require('lodash');

const bcrypt = require('bcrypt')
const md5 = require('md5')
const jwt = require('jwt-simple')
const passport = require('passport')
const ExtractJwt = require('passport-jwt').ExtractJwt
const JwtStrategy = require('passport-jwt').Strategy
const axios = require('axios');

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

    Product.aggregate(stages, function (err, datas) {
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
    var newProduct = new Product(req.body);
    
    newProduct.save(function (err, data) {
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

    Product.findById(id, function (err, data) {
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

    Product.aggregate(stages, function (err, datas) {
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

exports.update = function (req, res) {
    var updProduct = _.extend(req.data, req.body);

    updProduct.updateby = req.user;
    updProduct.save(function (err, data) {
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
    Product.findByIdAndUpdate(id, { delete_status: 1 }
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