const express = require('express')
const fs = require("fs")

const passport = require('passport');
const session = require('express-session');


const flash = require('connect-flash-plus');
const app = express()

const bodyParser = require('body-parser');

//const mongoose = require("mongoose")
//const vendor = mongoose.model("Vendor")

// where all of our schema's exist
require('./models')
const { vendor } = require('./models/user.js');

// Configure handlebars
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

// setup a session store signing the contents using the secret key
app.use(session({ secret: process.env.PASSPORT_KEY,
    resave: true,
    saveUninitialized: true
   }));

//middleware that's required for passport to operate
app.use(passport.initialize());

// middleware to store user object
app.use(passport.session());

const exphbs = require('express-handlebars')


// use flash to store messages
app.use(flash());

app.use(async function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.customer = req.customer || null;
    res.locals.login = req.user;
    
    // if there is a user logged in
    if (req.user) {
        var foundVendor = await vendor.findOne({ "_id" :  req.user._id });
        // If user cant be found in vendor database (hence, not a vendor)
        if (!foundVendor){
            res.locals.vanStatus = false;
        }
        // user is a vendor
        else {
            res.locals.vanStatus = req.user.open;
        }
    }
    else {
        res.locals.vanStatus = false;
    }
    switch (req.path.split('/')[1]) {
        case 'vendor':
            res.locals.pov = "vendor";
            break;

        case 'customer':
            res.locals.pov = "customer";
            break;

        default:
            res.locals.pov = "none";
            break;
    }

    next();
});    

app.engine('hbs', exphbs({
 defaultlayout: 'main',
 extname: 'hbs',
 helpers: require(__dirname + '/public/js/helper.js').helpers,
 partialsDir: __dirname + '/views/partials/'

}))

app.set('view engine', 'hbs')


// setting up routes
const customerRouter = require('./routes/customerRouter')
const vendorRouter = require('./routes/vendorRouter')
const e = require('express');

// GET home page
app.get('/', (req, res) => {
    res.redirect("/customer/home")
})

// these are our routes that will connect us to various landing pages
app.use('/customer', customerRouter)
app.use('/vendor', vendorRouter)

// for routes that does not exist
app.get('*', (req, res)=>{
    res.render("error", {"issue": "The page you are looking for doesnt exist...",
                            "redirectLink": "/customer/menu",
                        "solution": `Please click here to return to the menu`
                    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log('The Snacks in a Van app is listening')
})

module.exports = app
