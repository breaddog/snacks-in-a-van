const mongoose = require("mongoose")
const autoIncrement = require('mongoose-auto-increment')


// Template Schemas
const orderItemSchema = {
    snackID: {type: String, required: true},
    quantity: {type: Number, required: true},
    price:{type: Number, required: true}
}

const orderSchema = new mongoose.Schema({
    orderID: {type: Number, required: true},
    orderList: [orderItemSchema],
    discount: {type: Boolean, required: true},
    timeOrdered: {type: String, required: true}, // whatever Date() gave us
    timeRemaining: {type: Number, required: true}, // in minutes
    customerID: {type: Number, required: true},
    vendorID: {type: Number, required: true},
    status: {type: String, enum: ['COMPLETED','ONGOING', 'DELAYED', 'CANCELLED', 'FULFILLED']},
    pickupLocation: {type: String, required: true},
    timePickedUp : {type: String}
},
{collection: "orders"})

orderSchema.plugin(autoIncrement.plugin, {model: "orderSchema", field: "orderID"})

const orderItem = mongoose.model('orderItem', orderItemSchema)
const Order = mongoose.model('orders', orderSchema)

module.exports = {orderItem,  Order}
