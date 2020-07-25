'use strict';
// use model
var mongoose = require('mongoose');
//var autoIncrement = require("mongodb-autoincrement");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UsersSchema = new Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    profile: {
        type: String
    },
    active_status: {
        type: Number,
        default: 1
    },
    token_access: {
        type: String
    },
    login :{
        type: Number,
        default: 0
    },
    delete_status: {
        type: Number,
        default: 0
    },
    active_date:{
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        type: String
    },
    createby_id: {
        type: ObjectId
    },
    updateby: {
        type: String
    },
    updateby_id: {
        type: ObjectId
    }
});

mongoose.model("users_service", UsersSchema);