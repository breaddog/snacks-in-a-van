const { JSDOM } = require("jsdom");

// update to new password
function updateNewPassword() {
    if (typeof(window) !== 'undefined') {
        // retrieve customer id from url
        var link = window.location.href.split('/')
        var id = link[link.length - 1]

        var form = document.createElement("form")
        form.name = 'passwordUpdate'
        form.method = 'POST'
        form.action = "/customer/" + id  + "/updatePassword"
        
        // append form to body
        document.body.appendChild(form)
    
        old_pass = document.getElementById('old_password').value;
        new_pass = document.getElementById('new_password').value;
        

        // Password doesn't follow  password policy
        if (!checkPasswordPolicy(new_pass)) {
            document.getElementById("update_pass_error").innerHTML = "Password must have at least 8 characters, including a number and an alphabet"
        } 
        // New password and old password should be different 
        else if (old_pass == new_pass) {
            document.getElementById("update_pass_error").innerHTML = "Please ensure that your new password is different from your new password"
        }
        
        else if (checkPasswordPolicy(new_pass) && old_pass != new_pass){
            setTimeout(() => { document.getElementById("update_pass_success").innerHTML = "Successfully updated password. Redirecting you to login page now..."  }, 2000);
            form.submit()            
        }   
    }
}

function checkPasswordPolicy(password){
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/
    return (password.length >= 8) && passwordRegex.test(password)
}

module.exports = {
    updateNewPassword,
    checkPasswordPolicy,
}