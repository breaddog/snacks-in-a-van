
require('dotenv').config()    // for JWT password key

// used to create our local strategy for authenticating
// using username and password
const LocalStrategy = require('passport-local').Strategy;

// user model - customer and vendor
const { customer } = require('../models/user.js');
const { vendor } = require('../models/user.js');

// regex
const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

module.exports = function(passport) {

    // these two functions are used by passport to store information
    // in and retrieve data from sessions
    passport.serializeUser(function(Customer, done) {
        done(null, Customer._id);
    });

    passport.deserializeUser(async function(_id, done) {

        var foundCustomer = await customer.findOne( {'_id': _id});

        if (foundCustomer) {
            // console.log(foundCustomer);
            customer.findById(_id, function(err, Customer) {
                done(err, Customer);
            });
        }

        else {
            vendor.findById(_id, function(err, Vendor) {
                done(err, Vendor);
            });
        }
    });


    // strategy to login
    // this method only takes in username and password, and the field names
    // should match of those in the login form
    passport.use('local-customer-login', new LocalStrategy({
        username : 'email',
        password : 'password',
        passReqToCallback : true}, // pass the req as the first arg to the callback for verification
    function(req, email, password, done) {
        process.nextTick(function() {
            // see if the user with the email exists
            customer.findOne({ 'email' :  email }, function(err, Customer) {
                // if there are errors, user is not found or password
                // does match, send back errors
                if (err)
                    return done(err);
                if (!Customer){
                    return done(null, false, req.flash('error_msg', 'Incorrect username/password. Please try again.'));
                }
                if (!Customer.validPassword(password)){
                    // false in done() indicates to the strategy that authentication has
                    // failed
                    return done(null, false, req.flash('error_msg', 'Incorrect username/password. Please try again.'));
                }
                // otherwise, we put the user's email in the session
                else {
                    req.session.email = email; 
                    req.session.customerID = Customer.customerID;

                    // done() is used by the strategy to set the authentication status with
                    // details of the user who was authenticated
                    return done(null, Customer, req.flash('success_msg', 'Customer login successful!'));
                }
            });
        });

    }));



    // for signup
    passport.use('local-customer-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true }, // pass the req as the first arg to the callback for verification

         function(req, email, password, done) {

           
            process.nextTick( function() {
                customer.findOne({'email': email}, function(err, existingUser) {
                    // search a user by the username (email in our case)
                    // if user is not found or exists, exit with false indicating
                    // authentication failure
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    if (existingUser) {
                        return done(null, false, req.flash('error_msg', 'This email has been used.'));
                    }
                    // if its invalid
                    if (!validEmail(email)){
                        return done(null, false, req.flash('error_msg', 'Please enter a valid email.'))
                    }
                    // customer policy 
                    if (!checkPasswordPolicy(password)){
                        return done(null, false, req.flash('error_msg', 'Password must be at least 8 characters that includes alphabet characters and one number.'))
                    }
                    else {
                        // otherwise
                        // create a new customer
                        var newCustomer = new customer();
                        newCustomer.email = email;
                        newCustomer.password = newCustomer.generateHash(password);
                        newCustomer.firstName = req.body.firstName;
                        newCustomer.lastName = req.body.lastName;

                        // and save the user
                        newCustomer.save(function(err) {
                            if (err)
                                throw err;
                            
                            // put the user's email in the session so that it can now be used for all
                            // along with the customerID also 
                            req.session.email = email
                            req.session.customerID = newCustomer.customerID

                            // put the user's email in the session so that it can now be used for all
                            req.session.email = email;
                            req.session.customerID = newCustomer.customerID;

                            return done(null, newCustomer);
                        });
                    }
                });
            });
        }));

    // strategy to login
    // this method only takes in username and password, and the field names
    // should match of those in the login form
    passport.use('local-vendor-login', new LocalStrategy({
            usernameField : 'vanName',
            passwordField: 'password',
            passReqToCallback : true}, // pass the req as the first arg to the callback for verification
        function(req, vanName, password, done) {
            process.nextTick(function() {
                // see if the user with the email exists

                // empty fields
                if (vanName == null || password == null){
                    return done(null, false, req.flash('error_msg', 'Incorrect van name/password. Please try again.'));
                }  

                //otherwise continue
                vendor.findOne({ 'vanName' :  vanName }, function(err, Vendor) {
                    // if there are errors, user is not found or password
                    // does match, send back errors
                    if (err){
                        return done(err);
                    }
                    
                    if (!Vendor){
                        return done(null, false, req.flash('error_msg', 'Incorrect van name/password. Please try again.'));
                    }
                    if (vanName != Vendor.vanName){
                        return done(null, false, req.flash('error_msg', 'Incorrect van name/password. Please try again.'));
                    }
                    if (password != Vendor.password){ 

                        // if it wasnt because it was already hashed
                        if (!Vendor.validPassword(password)){
                            return done(null, false, req.flash('error_msg', 'Incorrect van name/password. Please try again.'));
                        }
                        // otherwise it was hashed already
                        else{
                            validVendorCredentials(req, Vendor, vanName, password, done, true)
                        }
                        
                    }
                    // otherwise it hasnt been hashed so hash it later on 
                    else {
                        validVendorCredentials(req, Vendor, vanName, password, done, false)
                    }
                });
            });

        }));
};

function validVendorCredentials(req, Vendor, vanName, password, done, hashed){
    // if not hashed hash the password for future reasons 
    if (!hashed){
        Vendor.password = Vendor.generateHash(password)
        // save for future reference
        Vendor.save((err)=>{
            if (err){
                return done(null, false, req.flash('error_msg', 'Login failed, please try again or contact an admin if issue persists.'));
            }
        })
    }
    // set things into the session
    req.session.vanName = vanName; 
    req.session.vendorID = Vendor.vendorID;
    // done() is used by the strategy to set the authentication status with
    return done(null, Vendor, req.flash('success_msg', 'Vendor login successful!'));


}
function validEmail(email){
    return emailRegex.test(String(email).toLowerCase());
}

function checkPasswordPolicy(password){
    return (password.length >= 8) && passwordRegex.test(password)
}