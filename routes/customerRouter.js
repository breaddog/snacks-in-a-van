const express = require('express')

// we will use the passport strategies we defined in
// passport.js file in config folder to signup and login
// a user.
const passport = require('passport');
require('../config/passport')(passport);

// add our router
const customerRouter = express.Router()

// require the customer controller
const userController = require('../controllers/userController.js')
// require order controller for retrieving orders
const orderController = require('../controllers/orderController.js')
// require the snacks controller
const menuController = require('../controllers/snacksController.js')
// require the vendor controller
const { customer } = require('../models/user');


// HOMEPAGE FOR CUSTOMER
customerRouter.get('/home', userController.getCustomerHome)
customerRouter.post('/home', userController.retreiveVendorJSONPost)


// CUSTOMER PROFILE
customerRouter.post('/:customerID/updateName', userController.updateCustomerName)
customerRouter.post('/:customerID/updatePassword', userController.updateCustomerPassword)
customerRouter.get('/:customerID/updatePassword', function(req, res){
    return res.redirect('/customer/login')
})
// MENU
// handle the GET request to get all snacks
customerRouter.get('/menu', (req, res) => menuController.getAllSnacks(req, res))
customerRouter.post('/menu', (req, res) => menuController.getAllSnacks(req, res))

// retrieve one snack
customerRouter.get('/menu/:snackID', (req, res) => menuController.getOneSnack(req, res))

// GET login form
// http:localhost:5000/user/
customerRouter.get("/login", (req, res) => {
    res.render('loginDesktop');
});

// // POST login form -- authenticate user
// // http:localhost:5000/user/login
customerRouter.post('/login', passport.authenticate('local-customer-login', {
    successRedirect : '/customer/menu', // redirect to the homepage
    failureRedirect : '/customer/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));


// // GET - show the signup form to the user
customerRouter.get("/signup", (req, res) => {
    res.render('registrationDesktop');
});


// // POST - user submits the signup form -- signup a new user
customerRouter.post('/signup', passport.authenticate('local-customer-signup', {
    successRedirect : '/customer/menu', // redirect to the homepage
    failureRedirect : '/customer/signup/', // redirect to signup page
    failureFlash : true // allow flash messages
}));


// LOGOUT
customerRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/customer/login');
});

// CUSTOMER
// redirects back to home 
customerRouter.get('/', function(req,res){
    return res.redirect('/customer/home')
})
// view cart for customer
customerRouter.post('/cart', orderController.viewCart)
customerRouter.get('/orders', function(req, res){
    if(req.isAuthenticated()){
    //if(req.session.customerID){
        res.redirect('/customer/'+req.session.customerID+'/orders');
    } else {
        res.redirect('/customer/login');
    }

})
customerRouter.get('/profile', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/customer/'+req.session.customerID);
    } else {
        res.redirect('/customer/login');
    }
})
// handle the GET request to get one customer
customerRouter.get('/:customerID', (req, res) => userController.getOneCustomer(req, res))

// handle GET request for customer orders
customerRouter.get('/:customerID/outstanding-orders', orderController.retrieveOutstandingOrdersbyID)

// handle GET request for customer orders
customerRouter.get('/:customerID/orders', orderController.retrieveAllOrders)

// CREATION
// handle POST request to add one customer
customerRouter.post('/', (req, res) => userController.createUser(req, res))

// sends cart to create a new order
customerRouter.post('/cart/checkout', orderController.addCartToOrder)
// hande POST request to update one customer
customerRouter.post('/:customerID', (req, res) => userController.updateCustomer(req, res))


// SNACKS
// handle POST request to add one snack
// customerRouter.post('/:customerID/add-snack', customerController.addOneSnackToCart)

// handle POST request to add one snack to order
customerRouter.post('/:customerID/add-snack-to-order', orderController.addOneSnackToOrder)

// handle POST request to remove one snack from order
customerRouter.post('/:customerID/remove-snack-from-order', orderController.removeOneSnackFromOrder)


// ORDERS
customerRouter.get('/:customerID/orders/:orderID', (req, res) => orderController.getOrderbyID(req, res))
customerRouter.post('/:customerID/orders/:orderID/cancelOrder', (req, res) => orderController.cancelOrder(req, res))
customerRouter.get('/:customerID/orders/:orderID/editOrder', (req, res) => orderController.editOrder(req, res))
customerRouter.post('/:customerID/orders/:orderID/updateOrder', (req, res) => orderController.updateOrder(req, res))



// export the router
module.exports = customerRouter