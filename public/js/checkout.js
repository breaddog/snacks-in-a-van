function confirmRequest(){
    if (confirm("Do you want to continue with the order?")){
        // extract value
        // check if cart is empty first
        var cart = localStorage.getItem('cart')

        if (cart == null){
            alert("Your cart is empty, why not order some items first?")
        }
        else{
            cart = JSON.parse(cart)
            if (cart.length == 0){
                alert("Your cart is empty, why not order some items first?")
            }
            else{
                // attempt to send order 
                sendOrderRequest()
            }
        }

    }
}

// post request to server
function sendOrderRequest(){

    // if a specific does not exist 
    if (document.getElementById('vendorChosen') === undefined || document.getElementById('vendorChosen') == null){

        // prompt redirection to vendor selection
        alert("Please select a vendor to order from before continuing!\n Redirecting you now...")
        window.location.href = "/customer/home"


    }
    else{

        // get cart
        var parsedCart = localStorage.getItem('cart')

        // create new cart if empty
        if (parsedCart === null){
            parsedCart = JSON.stringify([])
        }
        //cart = JSON.parse(cart)

        // create field for each input

        $.post("/customer/cart/checkout", {'cart': parsedCart}, function(){
            // on success redirect 
            alert("Your order has been successfully placed! Redirecting you to your orders page now...")
            window.location.href = "/customer/orders"
        })
        // error something happened flash 
        .fail(function(result){

            console.log(result.status)
            var error = document.getElementById('errorFlash')
            error.classList.add("alert-danger")
            error.classList.add("alert")
            
            // server issue
            if (result.status == 500){
                error.innerHTML = "We are unable to process your order, please try again in a while."
            }
            // non eexisting van
            else if (result.status == 503){
                error.innerHTML = `The van you are trying to order from appears to be closed, please choose another van from the home page.`
            }
            // error
            else if (result.status == 400){
                error.innerHTML = "Something went wrong, please try again in a while."
            }
            
        })

        

    }

}

// adds new field to form
function createField(key, value){

    var field = document.createElement('input')
    field.type = 'hidden'
    field.name = key
    field.id = key
    field.value = value
    
    // popup
    return field
}      

