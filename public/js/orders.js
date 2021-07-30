function cancelOrder() {
    // retrieve customer id and order from url
    var link = window.location.href.split('/')
    var customerID = link[link.length - 3]
    var orderID = link[link.length - 1]

    $.ajax({
        url:"/customer/" + customerID  + "/orders/" + orderID + "/cancelOrder",
        method: "POST",
        data : {},
        cache : false,
        success : function (data) {
                alert("Successfully cancelled order");
                window.location.href = "/customer/menu";
            }
        });    
}

function editOrder() {
    // retrieve customer id and order from url
    var link = window.location.href.split('/')
    var customerID = link[link.length - 3]
    var orderID = link[link.length - 1]

    $.ajax({
        url:"/customer/" + customerID  + "/orders/" + orderID + "/editOrder",
        method: "GET",
        success : function () {
            window.location.href = "/customer/" + customerID  + "/orders/" + orderID + "/editOrder";
        }
    });    
}


function updateOrder() {
    // retrieve customer id and order from url
    var link = window.location.href.split('/')
    var customerID = link[link.length - 4]
    var orderID = link[link.length - 2]

    var qty = document.getElementsByClassName("checkout-update-qty")

    var i = 0
    new_qty = []

    for(i;i<qty.length;i++) {
        new_qty.push(document.getElementsByClassName("checkout-update-qty")[i].value)
    }
    
    var orderItemSchema = [];
    var orderItem;
    var newPrice = 0;

    for (j = 0; j < new_qty.length; j++) {
        if (new_qty[j] != 0) {
            orderItem = {}
            orderItem["snackID"] = j+1;
            orderItem["quantity"] = new_qty[j];
            orderItem["price"] = 4.5 * new_qty[j];
            newPrice += orderItem["price"]
            orderItemSchema.push(orderItem)
        }
    }    

    var post_data = {}
    post_data["new_data"] = orderItemSchema

    // Nothing added to order
    if (JSON.stringify(orderItemSchema) == []) {
        alert("Please add something to your order");
        window.location.href = "/customer/" + customerID  + "/orders/" + orderID;
    }

    if (confirm('Are you sure you want to update your order? Your new subtotal is $' + newPrice)) {
        $.ajax({
            url:"/customer/" + customerID  + "/orders/" + orderID + "/updateOrder",
            method: "POST",
            data : post_data,
            cache : false,
            success : function (data) {
                alert("Successfully updated your order!");
                window.location.href = "/customer/" + customerID  + "/orders/" + orderID;
            }
        }); 
      } else {
        // Do nothing
      }
      
       
}