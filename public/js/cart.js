

function updateCart(itemID, quantity, price, name){
    // var itemID = document.getElementById('itemName').value
    // var quantity = document.getElementById('value').value
    // var price = document.getElementById('price').value

    if (quantity <= 0 || quantity == null){
        return alert("Please enter a value that is at least one")
    }

    // item will have this format
    var item = { "snackID": itemID,
                 "quantity": parseFloat(quantity),
                 "price": parseFloat(price)}

    var cart = localStorage.getItem('cart')

    // if cart doesnt exist yet
    if (cart === null || cart.length == 0){
        // create an empty cart
        var temp = []
        cart = JSON.stringify(temp)
    }

    // otherwise cart exists
    cart = JSON.parse(cart)

    // if cart not empty
    if (cart.length > 0){

        //try to find that an item like that already exists
        var existingItem = cart.find(cart => cart.snackID == itemID)
        // if existing
        if (existingItem !== undefined){
            // just update qty
            var index = cart.findIndex(function(item, i){return item.snackID == itemID})
            cart[index].quantity = parseFloat(quantity)

        }
        // otherwise add
        else{
            cart.push(item)
        }

    }
    // if empty just push to cart
    else{
        cart.push(item)
    }

    //turn cart back into string and set
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${quantity} ${name}(s) added to cart\nRedirecting you back to the menu...`)

    window.location.href = "/customer/menu"



}



function updateCartForItem(snackID){


    var value = document.getElementById(`change${snackID}`).value
    var name = document.getElementById(`nameValue${snackID}`).innerHTML
    var previousTotal

    // Ensure user enters a number if they want to edit the quantity of snack
    if (value == null){
        return alert("Please enter a valid value")
    }

    var message = `Change quantity of ${name} to ${value}?\nYou can always change it later before checkout`
    if(confirm(message)){
        // take in name
        // retreive cart (assumes that this button will be pressed if cart is full)
        var cart = JSON.parse(localStorage.getItem('cart'))


        // find the item now
        for (var item in cart){

            // if we find that item
            if (cart[item].snackID == snackID){
                
                console.log(value)
                // if we change it to zero
                if (parseFloat(value) == 0){
                    cart.splice(item, 1)
                    break
                }
                else{
                    // otherwise update accordingly
                    cart[item].quantity = parseFloat(value)
                    break
                }
                
                
                
            }
        }

        // get previous total to remove from new total
        previousTotal = document.getElementById(`subTotal${snackID}`).innerHTML
        previousTotal = previousTotal.replace("Sub Total: $", "")

        //set new quantity
        document.getElementById(`quantity${snackID}`).innerHTML = `Quantity: x${value}`

        //update subtotal which reflects the new total
        setSubtotal(snackID, value, previousTotal)

        if (cart.length == 0){
            localStorage.removeItem('cart')
            viewCart()
        }
        else{
            // set in localstorage
            localStorage.setItem('cart', JSON.stringify(cart))
        }

        

    }



}

function setSubtotal(snackID, quantity, previousSubtotal){


    var price = document.getElementById(`price${snackID}`).innerHTML
    var total = document.getElementById('total').innerHTML

    
    // clean it up
    total = total.replace("Total Price: $", "")
    price = price.replace("Item Price: $", "")


    // update total
    total = parseFloat(total) - parseFloat(previousSubtotal) + (parseFloat(price) * parseFloat(quantity))

    // set new subtotal
    document.getElementById(`subTotal${snackID}`).innerHTML = `Sub Total: $${parseFloat(price) * parseFloat(quantity)}`

    // reflect changes on new total value
    document.getElementById('total').innerHTML = `Total Price: $${total}`
}


function clearCart(){

    if (confirm("Are you sure you want to clear your cart? This action is irreversible")){

        // prepare the empty cart
        var temp = []
        cart = JSON.stringify(temp)

        localStorage.setItem('cart', temp)

        viewCart()

    }
}





function getTotal(){
    // get cart from local storage and JSON.parse
    var cart = localStorage.getItem('cart')
    var cartTotal = 0


    if (cart === null){
        return cartTotal
    }


    // for each item in the json cart
    for(var item in cart){
        cartTotal += cart[item].quantity * cart[item].price
    }

    // return total value
    return cartTotal
}

function viewCart(){

    var form = document.createElement("form")
    form.name = 'cartInfo'
    form.method = 'POST'
    form.action = '/customer/cart'

    // get cart
    var cart = localStorage.getItem('cart')
    //var curr_url = window.location.href

    // split customerID
    if (cart === null){
        cart = JSON.stringify([])
    }


    // create field for each input
    //form.appendChild(createField('customerID', customerID.split('=')[1]))
    form.appendChild(createField('cart', cart))
    //form.appendChild(createField('previousURL', curr_url))

    // append form to body
    document.body.appendChild(form)


    form.submit()

    return false
}

// adds new field to form
function createField(key, value){

    var field = document.createElement('input')
    field.type = 'hidden'
    field.name = key
    field.id = key
    field.value = value

    return field
}

// get a cookie
// function getCookie(name){
//     if (name.length == 0){
//         return undefined
//     }


//     // try to find that cookie
//     var cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`))
//     // .split('=')[0];

//     // empty
//     if (cookie === undefined){
//         return undefined
//     }


//     // then otherwise we just return it?
//     // all cookies are an object file
//     // how do we want to return it
//     return cookie
// }