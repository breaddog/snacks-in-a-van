const express = require('express')

// we will use the passport strategies we defined in
// passport.js file in config folder to signup and login
// a user.
const passport = require('passport');
require('../config/passport')(passport);

// add our router
const vendorRouter = express.Router()

// require the vendor controller
const vendorController = require('../controllers/userController.js')
// require order controller for retrieving orders
const orderController = require('../controllers/orderController.js')
const { vendor } = require('../models/user.js')



// login page for vendor
vendorRouter.get('/', (req, res) => res.redirect("/vendor/login"))
vendorRouter.get('/login', (req, res) => res.render("vendorLogin"))

// // POST login form -- authenticate vendor
// // http:localhost:5000/user/login
vendorRouter.post('/login', passport.authenticate('local-vendor-login', {
    successRedirect : '/vendor/location-setup', // redirect to the homepage
    failureRedirect : '/vendor', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));

// LOGOUT CLOSE
vendorRouter.get('/logout-close', function(req, res) {
    vendorController.logoutVendor(req, res);
    res.redirect('/vendor/logout');
});

// logout exit
vendorRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/vendor');
});




// location setup page
vendorRouter.get('/location-setup', (req, res) => res.render("locationSetup", {"normal": true}))
// send result to update van
vendorRouter.post('/location-setup', vendorController.setVanStatus)

// ready to open
vendorRouter.get('/ready', (req,res) => res.render("readyToOpen"))

// closing
vendorRouter.get('/closing', function(req, res){
    if(req.isAuthenticated()){
    //if(req.session.customerID){
        res.redirect('/vendor/'+req.session.vendorID+'/closing');
    } else {
        res.redirect('/vendor');
    }

})

// for redirecting current orders
vendorRouter.get('/current-orders', function(req, res){
    if(req.isAuthenticated()){
    //if(req.session.customerID){
        res.redirect('/vendor/'+req.session.vendorID+'/outstanding-orders');
    } else {
        res.redirect('/vendor');
    }

})

// handle GET request for outstanding orders
vendorRouter.get('/:vendorID/outstanding-orders', orderController.retrieveOutstandingOrdersbyID)

// for redirecting past orders
vendorRouter.get('/past-orders', function(req, res){
    if(req.isAuthenticated()){
    //if(req.session.customerID){
        res.redirect('/vendor/'+req.session.vendorID+'/past-orders');
    } else {
        res.redirect('/vendor');
    }
})

// get request for past orders
vendorRouter.get('/:vendorID/past-orders', orderController.retrievePastOrdersbyID)



vendorRouter.post('/opening', vendorController.setVanStatus);
vendorRouter.get('/opening', function(req, res){
    return res.redirect('/vendor/current-orders')
})




vendorRouter.get('/:vendorID/closing', (req, res) => vendorController.closeVan(req, res))

// retrieve all outstanding orders
vendorRouter.get('/outstanding-orders', orderController.retrieveAllOutstandingOrders)

// secret debug
vendorRouter.get('/secret', orderController.checkAllOrderStatus)


// detailed order for vendor
vendorRouter.get('/:vendorID/:orderID', orderController.getOrderbyID)




// ADD/UPDATE

// handle POST request to update one vendor
vendorRouter.post('/:vendorID', (req, res) => vendorController.updateVendor(req, res))

// ORDERS
// handle POST request mark order fulfilled
vendorRouter.post('/:vendorID/:orderID/fulfill', vendorController.markOrderAsFulfilled)
// handle POST request mark order completed
vendorRouter.post('/:vendorID/:orderID/complete', vendorController.markOrderAsCompleted)



// export the router
module.exports = vendorRouter