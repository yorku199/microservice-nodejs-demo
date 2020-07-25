'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    User = mongoose.model('users_service'),
    _ = require('lodash');

const bcrypt = require('bcrypt')
const md5 = require('md5')
const jwt = require('jwt-simple')
const passport = require('passport')
const ExtractJwt = require('passport-jwt').ExtractJwt
const JwtStrategy = require('passport-jwt').Strategy

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

    if (req.query.phone && req.query.phone != "null") {
        //mongoose.Types.ObjectId
        var str = req.query.phone.replace("-", "");
        var phone = '';
        for (var i = 0; i < str.length; i++) {
            phone += str.substring(i, i + 1) + '-?';
        }
        var regexp = new RegExp(phone, "g");
        stages.unshift({
            $match: {
                $or: [
                    { phone: { $regex: regexp } },
                    { phone: { $regex: regexp } }
                ]
            }
        });
    }

    if (req.query.name) {
        var regexp1 = new RegExp(req.query.name, "g");

        stages.unshift(
            {
                $match: {
                    $or: [
                        { firstname: regexp1 },
                        { lastname: regexp1 },
                    ]
                }
            }
        );
    }

    User.aggregate(stages, function (err, datas) {
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
    var newUser = new User(req.body);

    var memberCount = await User.count({ username: req.body.username, delete_status: 0 });

    if(req.body.username === "" || req.body.username === undefined || req.body.password === "" || req.body.password === undefined){
        var data = {
            status: "Error",
            message: "กรุณาระบุ username หรือ password",
        }

        return res.status(201).send(data)
    }

    if (memberCount > 0) {
        var data = {
            status: "Error",
            message: "ชื่อผู้ใช้งานนี้มีในระบบแล้ว",
        }
        return res.status(201).send(data)
    } else {

        if (req.body.password) {
            newUser.password = bcrypt.hashSync(req.body.password, 10)
        }
        
        newUser.save(function (err, data) {
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
    }
};

const SECRET = "secretKey";

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: SECRET
}

const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    console.log("Start Authorization app:username:" + payload.username + " token:" + payload.token_access);

    var updateCheck = []
    updateCheck = [{
        username: payload.username,
        delete_status: 0,
        active_status: 1,
        token_access: payload.token_access
    }]

    User.findOne({
        $and: updateCheck
    }, (err, result) => {
        if (err) {
            done(null, false);
            console.log(err);
        }
        if (!result) {
            done(null, false);
        }else{
            done(null, true);
        }
    });

});

passport.use(jwtAuth);

exports.requireJWTAuth = passport.authenticate("jwt", { session: false });

exports.checklogin = function (req, res) {
    if(req.body.username === "" 
        || req.body.username === undefined 
        || req.body.token_access === "" 
        || req.body.token_access === undefined){
        var data = {
            status: "Error",
            message: "ไม่พบข้อมูล username หรือ token_access",
        }

        return res.status(201).send(data)
    }

    var updateCheck = []

    updateCheck = [{
        username: req.body.username,
        delete_status: 0,
        active_status: 1,
        token_access: req.body.token_access
    }]

    User.findOne({
        $and: updateCheck
    }, (err, result) => {
        if(err){
            res.send(err)
        }
        if(!result){
            var data = {
                status: "Error",
                message: "Login Failure",
            }
            res.send(data)
        }else{
            var data = {
                status: "Success",
                message: "Login Success",
            }
            res.send(data)
        }
    });
}

exports.login = function (req, res) {

    if(req.body.username === "" || req.body.username === undefined || req.body.password === "" || req.body.password === undefined){
        var data = {
            status: "Error",
            message: "กรุณาระบุ username หรือ password",
        }

        return res.status(201).send(data)
    }

    var token = md5(Math.random().toString(36).substring(2, 15));
    User.findOne({
        username: req.body.username,
        delete_status: 0,
        active_status: 1,
    }, (err, result) => {
        if (err) {
            res.status(500).send(err)
        }
        if (!result) {
            var data = {
                status: "Error",
                message: "Login Failure:  ไม่พบชื่อสมาชิกนี้ในระบบกรุณาทำรายการใหม่อีกครั้ง",
            }
            res.send(data)
        } else {

            if (bcrypt.compareSync(req.body.password, result.password)) {

                User.findByIdAndUpdate(result._id, { login: 1, token_access: token}
                    , function (err, datas) {
                        if (err) {
                            return res.status(400).send({
                                status: 400,
                                message: err
                            });
                        } else {

                            const payload = {
                                user_id: datas._id,
                                username: req.body.username,
                                token_access: token,
                                iat: new Date().getTime()
                            };

                            var data = {
                                status: "Success",
                                message: "Login Success",
                                name: datas.firstname + " " + datas.lastname,
                                user_id: datas._id,
                                token_access: token,
                                jwt: jwt.encode(payload, SECRET)
                            }
                            res.send(data)
                        }
                    })
            } else {
                var data = {
                    status: "Error",
                    message: "Login Failure: รหัสผ่านไม่ถูกต้องกรุณาทำรายการใหม่อีกครั้ง",
                }
                res.send(data)
            }

        }
    })
}

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    User.findById(id, function (err, data) {
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

    User.aggregate(stages, function (err, datas) {
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
    var passOld = req.data.password
    var updUser = _.extend(req.data, req.body);
    updUser.updated = new Date();

    if (!is_empty(req.body.password)) {
        updUser.password = bcrypt.hashSync(req.body.password, 10)
    } else {
        updUser.password = passOld
    }

    updUser.updateby = req.user;
    updUser.save(function (err, data) {
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
    User.findByIdAndUpdate(id, { delete_status: 1 }
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