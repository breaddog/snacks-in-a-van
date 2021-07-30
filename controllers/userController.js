const mongoose = require("mongoose")
const Cookies = require('cookies')
const bcrypt = require('bcrypt')
const password = require("../public/js/password.js")
const e = require("express")
const { JSDOM } = require("jsdom");

const passport = require('passport');
require('../config/passport')(passport);

const customer = mongoose.model("Customer")
const vendor = require("../models/user").vendor
const Order = mongoose.model("orders")
const User = mongoose.model("User")


require('dotenv').config()

// Create user - POST req includes the user type (customer/vendor)
const createUser = async(req, res) => {
    // if customer, then create customer object
    if (req.body.userType == "CUSTOMER") {
        const newCustomer = new customer(req.body)
        newCustomer.save((err, result) => {
            if (err) {
                return res.send(err)
            }
            return res.send(result)
        })

        // Create user
        var user = new User(
            {
                "userType": "CUSTOMER",
                "userReferenceID": newCustomer._id
            }
        );

        // save user
        try {
            user.save()
        }
        catch (err) {
            res.status(400)
            return res.send("New user created")
        }
    }


    // if vendor, create vendor object
    else if (req.body.userType == "VENDOR") {
        const newVendor = new vendor(req.body)
        newVendor.save((err, result) => {
            if (err) {
                return res.send(err)
            }
            return res.send(result)
        })

        // Create user
        var user = new User(
            {
                "userType": "VENDOR",
                "userReferenceID": newVendor._id
            }
        );

        // save user
        try {
            user.save()
        }
        catch (err) {
            res.status(400)
            return res.send("New user created")
        }
    }
}


const updateCustomer = async(req, res) => {
    const newCustomer = req.body

    try{
        const oneCustomer = await customer.findOne({"customerID" : req.body.customerID})
        if(!oneCustomer) {
            res.status(400)
            return res.send("Customer not found in database")
        }

        Object.assign(oneCustomer, newCustomer)
        let result = await oneCustomer.save()
        return res.send(result)

    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database update failed")
    }
}

// Update customer's name
const updateCustomerName = async (req, res) => {
    try {
        // Get customer by ID
        const oneCustomer = await customer.findOne({"customerID": req.params.customerID})
        if (!oneCustomer) {
            res.status(400)
            return res.send("Customer does not exist")
        }

        // first name or last namme?
        if (req.body.firstName !== undefined){
            oneCustomer.firstName = req.body.firstName

            let result = await oneCustomer.save()
            return res.send("Successfully updated customer's first name. Please refresh your page again.")
        }
        else{
            oneCustomer.lastName = req.body.lastName

            let result = await oneCustomer.save()
            return res.send("Successfully updated customer's last name. Please refresh your page again.")
        }

    }

    catch (err) {
        res.status(400)
        return res.send("Database update failed")
    }
}

// Update password of customer by entering old and new password
const updateCustomerPassword = async (req, res) => {
    try {
        // Get customer by ID
        const oneCustomer = await customer.findOne({"customerID": req.params.customerID})

        if (!oneCustomer) {
            res.status(400)
            return res.send("Customer does not exist")
        }

        var old_password = req.body.old_pw
        var new_password = req.body.new_pw

        if (!oneCustomer.validPassword(old_password)) {
            return res.render("passwordError")
        }

        if (old_password == null || new_password == null){
            console.log("enter both fields")
            return res.send("Fill in both ")
        }

        // Check if old password entered is valid
        old_password_encrypted = oneCustomer.generateHash(old_password)


        
        // Check if new password is valid, then encrypt password and save in database
        if (req.body.old_pw != new_password && password.checkPasswordPolicy(new_password)) {
            oneCustomer.password = oneCustomer.generateHash(new_password)

            // Save new password and redirect user to login page
            oneCustomer.save(function(err){
                if (err)
                    throw err
                return res.redirect("/customer/login")
            })

        }
    }

    catch (err) {
        console.log(err)
        res.status(400)
        return res.send("Database update failed")
    }
}


const updateVendor = async(req, res) => {
    const newVendor = req.body

    try{
        const oneVendor = await vendor.findOne({"vendorID" : req.body.vendorID})
        if(!oneVendor) {
            res.status(400)
            return res.send("Vendor not found in database")
        }

        Object.assign(oneVendor, newVendor)
        let result = await oneVendor.save()
        return res.send(result)

    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database update failed")
    }

}


const getCustomerHome = async(req, res)=>{
    // if its a first load

    try {
        var vendors = await vendor.find({"open": true}).lean()
        var vansOpen

        if (vendors.length > 0){
            vansOpen = true
        }
        else{
            vansOpen = false
        }
        return res.render('customerHome', {"vendors": vendors,
                                            "loggedIn":req.isAuthenticated(),
                                            "vansOpen": vansOpen
                                            })
    }
    catch (err) {
        res.status(400)
        return res.send("Customer Home Failure")
    }

}

// takes customer location, parses it, returns 5 nearest vans
// client side rendering
const retreiveVendorJSONPost = async (req, res, next) =>{

    // if not ajax ignore the request
    if (("XMLHttpRequest" != req.get('x-requested-with')) || !("XmlHttpRequest" != req.get('x-requested-with'))){
        return next()
    }

    // otherwise business as usual
    var customerLocation = req.body.customerLocation

    if (customerLocation != undefined){
        customerLocation = JSON.parse(customerLocation)
    }
    var simplifiedVendors = []
    var vendors = await vendor.find();

    // retrieve locations
    for (var index in vendors){
        // only want open vendors
        if (vendors[index].open){

            var simplified = {
                "vendorID": vendors[index].vendorID,
                "vanName": vendors[index].vanName,
                "currentLocation": vendors[index].currentLocation,
                "address": vendors[index].address,
                "open": vendors[index].open
            }

            if (customerLocation != undefined && customerLocation.length == 2){
                simplified.distance = getHaversineDistance(customerLocation, simplified.currentLocation)
            }
            simplifiedVendors.push(simplified)
        }

    }
    if (vendors.length == 0 || vendors == null){
        return res.send(JSON.parse([]))
    }
    else{
        // if the customer location was passed on
        if (customerLocation.length  == 2){
            // filter through them and only get the 5 nearest ones
            simplifiedVendors.sort(function(a, b){
                return a.distance - b.distance
            })

            // cutoff
            var cutoff = 5
            if (simplifiedVendors.length < 5){
                cutoff = simplifiedVendors.length
            }
            // prevents from returning a splice that exceeds array len
            simplifiedVendors = simplifiedVendors.slice(0, cutoff)

        }
        // if not passed on just render the entire list
        return res.send(simplifiedVendors)
    }


}

// distance between two points defined as [lat, log] accounting
// for the earths curvature
// https://stackoverflow.com/a/21623206

function getHaversineDistance(customer, vendor){

    // earths curvature
    var p = 0.017453292519943295

    const c = Math.cos
    const a =  0.5 - c((vendor[0] - customer[0]) * p)/2 +
                    c(customer[0] * p) * c(vendor[0] * p) *
                    (1 - c((vendor[1] - customer[1]) * p))/2;


    return Math.round(12742 * Math.asin(Math.sqrt(a)), 2)
}


// get request
const getOneCustomer = async(req, res) => {
    try {
        var customerID
        // for the weird ones
        if (isNaN(req.params.customerID)){
            return res.render("error")
        }
        // trying to access but havent logged in
        if (req.session.customerID == undefined){
            // for the weird URL's
            res.redirect("/customer/login")
        }
        else{
            // they can never access someone elses account at all
            const oneCustomer  = await customer.findOne({"customerID" : req.session.customerID}).lean()
            if (oneCustomer == null) {
                res.status(404)
                res.render("error")
            }

            res.render("customerDetails", {"oneCustomer": oneCustomer})



        }
    }
    catch(err) {
        res.status(400)
        return res.render("error", {"issue": "Why not try creating an account?",
                                    "redirectLink": "/customer/",
                                    "solution": "You can do so here!" })
    }


}

const getOneVendor = async(req, res) => {
    try {
        const oneVendor  = await vendor.findOne({"vendorID" : req.params.vendorID}).lean()
        if (oneVendor == null) {
            res.status(404)
            res.send("Vendor not found")
        }
        res.send(oneVendor)
    }
    catch(err) {
        res.status(400)
        return res.send("One Vendor Failure")
    }

}

// Set status of the van
const setVanStatus = async (req, res) => {

    var location = req.body.location
    var address = req.body.address

    if (req.session.vendorID == undefined || req.session.vendorID == null){
        return res.render("locationSetup", {"success": false, "error_msg": "Please login before continuing."})
    }
    // no location
    if (location == null || location == undefined){
        return res.render("locationSetup", {"success": false, "error_msg": "Location was invalid please try again."})
    }
    if (address == null){
        return res.render("locationSetup", {"success": false, "error_msg": "Address had some issues with it, please enter the description again."})
    }
    else if (address.replace(" ", "").length < 10 || address.split('').length < 2 || address == ""){
        return res.render("locationSetup", {"success": false, "error_msg": "Please enter a valid description of the address."})
    }
    else{

        location = JSON.parse(location)
        // everything good lets continue 
        if (location.length != 2){
            return res.render("locationSetup", {"success": false, "error_msg": "Location was invalid please try again."})
        }
        else{

            try{
                // Get vendor by ID
                const oneVendor = await vendor.findOne({"vendorID": req.session.vendorID})
                
                if (!oneVendor) {
                    return res.render("locationSetup", {"success": false, "error_msg": "Please log in first before proceeding."})
                }
    
                // Update currentLocation and address
                oneVendor.currentLocation = location
                oneVendor.address = address
                oneVendor.open = true
    
    
                // Save to database
                let result = await oneVendor.save(function(err){
                    
                    if (err){
                        throw err
                    }
                    // good stuff!
                    return res.render("locationSetup", {"success": true})
                })
            }
            catch(err){
                console.log(err)
                return res.render("locationSetup", {"success": false, "error_msg": "Something is wrong with recording your location. Please contact an admin if this issue persists."})
            }

        }
        
        
    }
     
}

const closeVan = async(req, res) => {
    try {

        const oneVendor  = await vendor.findOne({"vendorID" : req.params.vendorID})
        if (oneVendor == null) {
            res.status(404)
            res.send("Vendor not found")
        }

        oneVendor.open = false
        res.locals.vanStatus = false
        let result = await oneVendor.save()

        return res.render("locationSetup", {"success": true, "justClosed": true})



    } catch (err) {
        res.status(400)
        return res.render('vendorError', 
            {"issue": `There seems to have been an issue with logging out. 
                        <br>If you can still see the logout button in the navbar please press that and try again. 
                        </br>Otherwise refresh the page`,
            "redirectLink": `javascript:history.back()`,
            "solution": "Or tap here to return to the previous page."})
    }


}

const logoutVendor = async(req, res) => {

    try {

        const oneVendor  = await vendor.findOne({"vendorID" : res.locals.login.vendorID})
        if (oneVendor == null) {
            res.status(404)
            res.send("Vendor not found")
        }

        oneVendor.open = false
        res.locals.vanStatus = false
        let result = await oneVendor.save()



    } catch (err) {
        res.status(400)
        // return res.send("Failed to close van when logging out")
    }

}

// change order's status to READY
const markOrderAsFulfilled = async(req, res) => {
	try {

    	// find order
    	const order = await Order.findOne({"orderID": req.body.orderID})

    	if (!order) {
        	res.status(400)
        	return res.send("Order does not exist")
        }

    	// Order found
    	order.status = 'FULFILLED'

    	let result = await order.save()
    	return res.redirect("/vendor/" + order.vendorID + "/" + order.orderID);

	} catch (err) {
    	console.error(err);
        res.status(400)
    	return res.send("Order failed to be marked as Ready")
	}
}

const markOrderAsCompleted = async(req, res) => {
    try {

    	// find order
    	const order = await Order.findOne({"orderID": req.body.orderID})

    	if (!order) {
        	res.status(400)
        	return res.send("Order does not exist")
        }

    	// Order found
    	order.status = 'COMPLETED'
        order.timePickedUp = new Date()

    	let result = await order.save()
    	return res.redirect("/vendor/" + order.vendorID + "/" + order.orderID);

	} catch (err) {
    	console.error(err);
        res.status(400)
    	return res.send("Order failed to be marked as Ready")
	}
}

const authenticateLoginDetails = (req, res) => {
	var cookies = new Cookies(req, res)

    // Find the customer
	var currentCustomer = customer.findOne({"email": req.body.email})
	// User found
    if (currentCustomer) {

        var currentUser = User.findOne({"userReferenceID": currentCustomer._id})

        // if password correct
        if (req.body.password == currentCustomer.password){

            // avoid double session
            // already active
            if (currentUser.sessionStatus){
                res.status(401)
                return res.send("User has already logged in")
            }

            // set sessionStatus as loggedIn
            currentUser.sessionStatus = true

            // create cookie with customerID
            cookies.set('customerID', currentCustomer.customerID)

            res.redirect('/menu')
        }

        // Incorrect password
        else {

            return res.send("Username/password is incorrect. Please try again.")

        }
    }

	// User not found
    res.status(401)
	return res.send("Username/password is incorrect. Please try again.")
}


const registerCustomer = (req,res) => {

	// if password re-entered is different
	if (req.body.password != req.body.cpassword){
		return res.send("Passwords do not match")
    }

	// email already associated with customer
    if (customer.exists({"email": req.body.email})) {
        res.status(401)
        res.send("Email is already in use")
    }

    // take details from req and put into new customer object
    const customerDetails = {
	    // auto-incrementer used for customerID
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    }

    try{
        // save customer to customer database
		createCustomer(customerDetails, res)

	} catch (err){
		res.status(400)
		return res.send("Error in creating customer")
    }

}





module.exports = {
    getOneCustomer,
    getOneVendor,
    updateCustomer,
    updateVendor,
    setVanStatus,
    markOrderAsFulfilled,
    authenticateLoginDetails,
    registerCustomer,
    createUser,
    getCustomerHome,
    retreiveVendorJSONPost,
    updateCustomerName,
    updateCustomerPassword,
    markOrderAsCompleted,
    closeVan,
    logoutVendor
}
