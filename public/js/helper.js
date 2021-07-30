var fs = require('fs');
const { SchemaTypeOptions } = require('mongoose');

var register = function(Handlerbars) {
    var helpers = {
        getSubtotal: function(price, quantity){
            return parseInt(price) * parseInt(quantity)
        },

        ifOpen: function(vanStatus, options){
            if (vanStatus == false) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },

        ifCustomer: function(pov, options){
            if (pov == "customer") {
                return options.fn(this);
            }
        },

        ifVendor: function(pov, options){
            if (pov == "vendor") {
                return options.fn(this);
            }
        }


    };

    if (Handlerbars && typeof Handlerbars.registerHelper === "function") {
        // register helpers listed above
        for (var helper in helpers) {
            Handlerbars.registerHelper(helper, helpers[helper]);
        }

    } else {
        return helpers;
    }
};

function generateScriptTag(path){
    var script = fs.readFileSync(path)
    return "<script>\n" + script + "</script>\n"
}

// export helpers 
module.exports.register = register;
module.exports.helpers = register(null);   