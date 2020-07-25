'use strict';
// use model
var mongoose = require('mongoose');
//var autoIncrement = require("mongodb-autoincrement");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ProductsSchema = new Schema({
    product_id: {
        type: String
    },
    product_title: {
        type: String
    },
    product_detail: {
        type: String
    },
    brand: {
        type: String
    },
    model: {
        type: String
    },
    size: {
        type: String
    },
    cost: {
        type: Number,
        default: 0.00
    },
    price: {
        type: Number,
        default: 0.00
    },
    active_status: {
        type: Number,
        default: 1
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

mongoose.model("products", ProductsSchema);