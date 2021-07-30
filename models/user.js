const mongoose = require("mongoose")
const Order = require("./order")
const autoIncrement = require('mongoose-auto-increment')
const bcrypt = require('bcrypt')


const passwordRegex = /(?=.*[0-9_])(?=.*[a-z])(?=.*[A-Z])([- [:alnum:]!@$%^&*()_+|~=`{}\[\]:";'<>?,.\/]*)/
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
// parent user
const User = new mongoose.Schema ({
    userID: String,
    userType: String,

    // this can be either customer or vendor (_id in MongoDB)
    userReferenceID: mongoose.Schema.Types.ObjectId

},
{collection: "User"})


const Customer = new mongoose.Schema({
    customerID: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
},
{collection: "Customer"})


const Vendor = new mongoose.Schema({
    vendorID: {type: Number, required: true, unique: true},
    vanName:{type: String, required: true},
    password: {type: String, required: true},
    currentLocation : [Number],
    address: {type: String, required: true},
    open: {type: Boolean, required: true},
    image: {type: String, required: true}
},
{collection: "Vendor"})

Customer.plugin(autoIncrement.plugin, {model: "Customer", field: "customerID", startAt: 1})
Vendor.plugin(autoIncrement.plugin, {model: "Vendor", field: "vendorID", startAt: 1})
User.plugin(autoIncrement.plugin, {model: "User", field: "userID", startAt: 1})

// method for Customer generating a hash; used for password hashing
Customer.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

// checks if Customer password is valid
Customer.methods.validPassword = function(password) {

    // if it doesnt conform to our policy 
    // if (!checkPasswordPolicy(password)){
    //     return false
    // }
    return bcrypt.compareSync(password, this.password)
}

Customer.methods.checkPasswordPolicy = function(password){
    return checkPasswordPolicy(password)
}

// method for Vendor generating a hash; used for password hashing
Vendor.methods.generateHash = function(password) {
    return generateBcryptHash(password)
}

// checks if Vendor password is valid
Vendor.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}


// valid email 
Customer.methods.validEmail = function(email){
    // some regex for the emails (too complex for my liking yallah)
    return emailRegex.test(String(email).toLowerCase());
}
// regex (not implemented yet )
function checkPasswordPolicy(password){
    return (password.length >= 8) && passwordRegex.test(password)
}

function generateBcryptHash(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
}

const customer = mongoose.model("Customer", Customer)
const vendor = mongoose.model("Vendor", Vendor)
const user = mongoose.model("User", User);
module.exports = {customer, vendor, user, checkPasswordPolicy, generateBcryptHash}
