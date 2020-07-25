'use strict';
// use model
var mongoose = require('mongoose');
//var autoIncrement = require("mongodb-autoincrement");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var OrdersSchema = new Schema({
    bill_number: {
        type: String
    },
    supplier: {
        type: String
    },
    user_id: {
        type: ObjectId
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    order_status: {
        type: String,
        enum: [ "Proceed", "Sending", "Received", "Cancel"],
        default: "Proceed"
    },
    order_list :[{
        product_id: {
            type: ObjectId
        },
        product_number: {
            type: String
        },
        qty: {
            type: Number
        },
        price: {
            type: Number
        },
        discount: {
            type: Number
        },
    }],
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

mongoose.model("orders", OrdersSchema);