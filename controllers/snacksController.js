const mongoose = require("mongoose")
const Cookies = require("cookies")

// import snack model
const Snack = mongoose.model("Snack")
const Vendor = mongoose.model("Vendor")

const getAllSnacks = async (req, res) => {
    try {
        
        // if the method is post then store vendorID 
        if (req.method == 'POST'){
            req.session.vendorID = req.body.vendorID
        }

        
        // then find the vendor 
        var vendor = await Vendor.findOne({
            "vendorID": req.session.vendorID
        }).lean()

        var vendorSelected = false
        if (!(vendor == null)){
            vendorSelected = true
        }

        var menu = await Snack.find().lean()

        return res.render("menu", {
            "menu": menu,
            "vendorSelected": vendorSelected,
            "vendor": vendor
        })
    } catch (err) {
        return res.render("error", {"issue": "Something appears to be wrong...",
                            "redirectLink": "/customer/home",
                        "solution": `Please click here to return to the homepage`
                        })
    }
}

const getOneSnack = async (req, res) => {
    try {
        const oneSnack = await Snack.findOne({
            "snackID": req.params.snackID
        }).lean()
        if (oneSnack === null) {
            // no snack found in database
            res.status(404)
            req.flash("error_msg", "That item doesnt exist in our menu, why not select something that we offer instead?")
            return res.redirect('/customer/menu')
        }

        //return res.send(oneSnack)
        return res.render("detailedMenu", {
            "oneSnack": oneSnack
        })
        // snack was found
    } catch (err) {
        // error occurred
        return res.render("error", {"issue": "Something appears to be wrong...",
                            "redirectLink": "/customer/home",
                        "solution": `Please click here to return to the homepage`
                    })
    }
}


//export the functions
module.exports = {
    getAllSnacks,
    getOneSnack,
}