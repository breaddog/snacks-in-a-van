const Cookies = require("cookies")
const mongoose = require("mongoose")
const fs = require('fs')
const passport = require('passport');
require('../config/passport')(passport);


const Order = mongoose.model("orders")
const orderItem = mongoose.model("orderItem")
const Customer = mongoose.model("Customer")
const Vendor = mongoose.model("Vendor")
const User = mongoose.model("User")
const Snack = mongoose.model("Snack")

// use userController to get requests for getting userID and what not
const userController = require('./userController.js')
const snacksController = require('./snacksController.js');
const {
    vendor
} = require("../models/user");
const {
    assert
} = require("console");

let timeLimit = 15

// receive order request
const viewCart = async (req, res) => {

    var receivedCart = []
    var cartIsEmpty = true
    var isAuthenticated = req.isAuthenticated()
    // check if cart is empty
    if (req.body.cart.length && (req.body.cart != "[]")) {
        receivedCart = JSON.parse(req.body.cart)
        cartIsEmpty = false
    }

    var foundSnacks = []
    totalPrice = 0
    // new orderItems thing

    // go through the cart

    for (var cartItem of receivedCart) {

        // if we find the corresponding snack
        var snack = await Snack.findOne({
            "snackID": cartItem.snackID
        })

        // if it is found...
        if (snack != null) {

            var item = {
                "snackID": snack.snackID,
                "name": snack.name,
                "price": snack.price,
                "image": snack.image,
                "quantity": cartItem.quantity,
            }
            item.subtotal = item.price * item.quantity

            foundSnacks.push(item)

            // set new price
            totalPrice += item.subtotal
        }
    }
    // display van anme as well
    var vendor = await Vendor.findOne({
        "vendorID": req.session.vendorID
    }).lean()
    var vanSelected = false
    if (vendor != null) {
        vanSelected = true
    }

    // then for each new item we have found represent it on the site
    return res.render("checkout", {
        "cart": foundSnacks,
        "total": totalPrice,
        "cartIsEmpty": cartIsEmpty,
        "authenticated": isAuthenticated,
        "vendor": vendor,
        "vanSelected": vanSelected

    })

}

// retrieves all orders for a given customer
const retrieveAllOrders = async (req, res) => {
    try {
        // check if its for the guy or not
        if (req.session.customerID == undefined) {
            res.redirect('/customer/login')

        } else if (req.session.customerID != req.params.customerID) {
            res.redirect(`/customer/${req.session.customerID}/orders`)
        } else {

            var outstandingOrders = await Order.find({
                $and: [{
                        "customerID": req.params.customerID
                    },
                    {
                        $or: [{
                                "status": "ONGOING"
                            },
                            {
                                "status": "DELAYED"
                            },
                            {
                                "status": "READY"
                            }
                        ]
                    }
                ]
            }).lean()

            for (var order of outstandingOrders) {
                order.vendor = await Vendor.findOne({
                    "vendorID": order.vendorID
                }).lean()
                var total = 0;
                checkDiscount(await Order.findOne({
                    "orderID": order.orderID
                }))
                for (var item of order.orderList) {
                    total += item.price - (+order.discount * 0.2 * item.price)
                }
                order.priceTotal = total
            }

            const pastOrders = await Order.find({
                $and: [{
                        "customerID": req.params.customerID
                    },
                    {
                        $or: [{
                                "status": "COMPLETED"
                            },
                            {
                                "status": "FULFILLED"
                            }
                        ]
                    }
                ]
            }).lean()
            // const pastOrders=await Order.find().lean()
            for (order of pastOrders) {
                order.vendor = await Vendor.findOne({
                    "vendorID": order.vendorID
                }).lean()
                total = 0;
                for (item of order.orderList) {
                    total += parseFloat(item.quantity) * parseFloat(item.price)
                }
                order.priceTotal = total
            }
            return res.render('OrderList', {
                "outstandingOrders": outstandingOrders,
                "pastOrders": pastOrders
            })


        }

    } catch (err) {
        res.status(400)
        return res.send("Cannot reach order database")
    }

}

const retrieveAllOutstandingOrders = async (req, res) => {

    try {

        const outstandingOrders = await Order.find({
            $or: [{
                    "status": "ONGOING"
                },
                {
                    "status": "DELAYED"
                },
                {
                    "status": "FULFILLED"
                }
            ]
        })


        if (outstandingOrders) {
            return res.send(outstandingOrders)
        } else {
            return res.send("No outstanding orders, congrats! Good Job!")
        }



    } catch (err) {
        res.status(400)
        return res.send("Cannot reach order database")
    }





}
// retrieve outstanding orders by ID
const retrieveOutstandingOrdersbyID = async (req, res) => {
    try {
        await checkAllOrderStatus(req, res);
        var outstandingOrders

        // customer
        // its a very dodgy way basically
        if (req.params.vendorID === undefined) {

            outstandingOrders = await Order.find({
                $and: [{
                        "customerID": req.params.customerID
                    },
                    {
                        $or: [{
                                "status": "ONGOING"
                            },
                            {
                                "status": "DELAYED"
                            },
                            {
                                "status": "FULFILLED"
                            }
                        ]
                    }
                ]
            })
            if (outstandingOrders.length > 0) {
                return res.send(outstandingOrders)
            } else {
                return res.send("No outstanding orders, why not make an order?")
            }
        }
        // vendor
        else {
            outstandingOrders = await Order.find({
                $and: [{
                        "vendorID": req.params.vendorID
                    },
                    {
                        $or: [{
                                "status": "ONGOING"
                            },
                            {
                                "status": "DELAYED"
                            },
                            {
                                "status": "FULFILLED"
                            }
                        ]
                    }
                ]
            }).lean()
            if (outstandingOrders.length > 0) {
                for (var order of outstandingOrders) {
                    if (order.customerID) {
                        //console.log(order);
                        var customer = await Customer.findOne({
                            "customerID": order.customerID
                        }).lean();
                        if (customer) order.customerName = customer.firstName;
                        if (order.status == "ONGOING") order.isOngoing = true;
                        else if (order.status == "DELAYED") order.isDelayed = true;
                        else if (order.status == "FULFILLED") order.isReady = true;
                    }

                }
            }
            return res.render('vendorCurrentOrderList', {
                "outstandingOrders": outstandingOrders,
            });

        }
    } catch (err) {
        res.status(400)
        return res.send("Failed to query database")
    }

}

// retrieve past orders by ID vendor only
const retrievePastOrdersbyID = async (req, res) => {
    try {
        await checkAllOrderStatus(req, res);

        var pastOrders = await Order.find({
            $and: [{
                "vendorID": req.params.vendorID
            }, {
                "status": "COMPLETED"
            }]
        }).lean()
        if (pastOrders.length > 0) {
            for (var order of pastOrders) {
                if (order.customerID) {
                    //console.log(order);
                    var customer = await Customer.findOne({
                        "customerID": order.customerID
                    }).lean();
                    if (customer) order.customerName = customer.firstName;
                    var d = new Date(order.timeOrdered);
                    //order.timeOrdered = d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear;
                }
                if (order.timePickedUp != undefined) {
                    var d = new Date(order.timePickedUp)
                    order.hoursPickedUp = d.getHours();
                    order.minutesPickedUp = d.getMinutes();
                }
            }
        }
        return res.render('vendorPastOrder', {
            "pastOrders": pastOrders,
        });


    } catch (err) {
        res.status(400)
        return res.send("Failed to query database")
    }

}


// get order
const getOrderbyID = async (req, res) => {
    try {
        const detailedOrder = await Order.findOne({
            "orderID": req.params.orderID
        }).lean()

        //is the person viewing the person who is supposed to see this
        if (req.session.customerID == undefined && req.params.customerID) {
            res.redirect('/customer/login')
        }
        // youre snooping go back
        else if (req.session.customerID != detailedOrder.customerID && req.params.customerID) {
            res.redirect(`/customer/${req.session.customerID}/orders`)
        }

        //is the vendor supposed to see this
        if (req.session.vendorID == undefined && req.params.vendorID) {
            res.redirect('/vendor')
        }
        // youre snooping on private information of other vendors;
        // we are doing you a favor by preventing you from potentially committing
        // a crime..no need to thank us
        else if (req.session.vendorID != detailedOrder.vendorID && req.params.vendorID) {
            res.redirect(`/vendor/${req.session.vendorID}/outstanding-orders`)
        }

        // order doesn't exist
        if (detailedOrder == null) {
            if (req.session.customerID) {
                return res.render("error", {
                    "issue": "The order you're looking for doesn't exist...",
                    "redirectLink": `/customer/${req.session.customerID}/orders`,
                    "solution": `You can return to your orders page by clicking here.`
                })
            } else {
                return res.render("error", {
                    "issue": "The order you're looking for doesn't exist...",
                    "redirectLink": `/vendor/${req.session.vendorID}/orders`,
                    "solution": `You can return to your orders page by clicking here.`
                })
            }
        }

        checkDiscount(await Order.findOne({
            "orderID": req.params.orderID
        }))

        var vendor = await Vendor.findOne({
            "vendorID": detailedOrder.vendorID
        });

        // no vendor exists, cancel order
        if (!vendor){
            var temp = await Order.find({'orderID': detailedOrder.orderID})
            temp.status =  "CANCELLED"

            await temp.save()

            if (req.session.vendorID){
                return res.render("vendorError", {
                    "issue": `This order has issues with it and will be cancelled.
                                <br>You do not have to worry about this order anymore</br>`,

                    "redirectLink": `/vendor/${req.session.vendorID}/outstanding-orders`,
                    "solution": `You can return to your orders page by clicking here.`
                })
            }
            else{
                return res.render("error", {
                    "issue": `Unfortunately we have to cancel your order due to some issues with it.
                            <br>We sincerely apologise and ask you to remake your order.</br>`,
                    "redirectLink": `/customer/${req.session.customerID}/orders`,
                    "solution": `You can return to your orders page by clicking here.`
                })
            }


            
        }
        else{
            detailedOrder.vendorName = vendor.vanName

            // for each item in detailed order
            for (var item of detailedOrder.orderList) {
                var snack = await Snack.findOne({
                    "snackID": item.snackID
                })
                if (!snack) {
                    // failsafe if it returns object id
                    snack = await Snack.findOne({
                        "_id": item.snackID
                    })
                }
            }

            // do not show cancelled orders
            if (detailedOrder.status == "CANCELLED") {
                if (req.session.customerID) {
                    return res.render("error", {
                        "issue": "The order you're looking for doesn't exist...",
                        "redirectLink": `/customer/${req.session.customerID}/orders`,
                        "solution": `You can return to your orders page by clicking here.`
                    })
                } else {
                    return res.render("error", {
                        "issue": "The order you're looking for doesn't exist...",
                        "redirectLink": `/vendor/${req.session.vendorID}/outstanding-orders`,
                        "solution": `You can return to your orders page by clicking here.`
                    })
                }
            }
            // otherwise everything ok
            else {
                var subtotal = 0;
                // for each item in detailed order
                for (var item of detailedOrder.orderList) {
                    var snack = await Snack.findOne({
                        "snackID": item.snackID
                    })
                    if (!snack) {
                        // failsafe if it returns object id
                        snack = await Snack.findOne({
                            "_id": item.snackID
                        })
                        if (!snack) {
                            if (req.session.customerID) {
                                return res.render("error", {
                                    "issue": 'snack not found',
                                    "redirectLink": `/customer/${req.session.customerID}/orders`,
                                    "solution": "You can return to your orders page by clicking here."
                                })
                            }
                        }
                    }
                    item.image = snack.image
                    item.name = snack.name
                    var price = parseFloat(snack.price) * parseFloat(item.quantity)
                    subtotal += price
                    item.price = price - (+detailedOrder.discount * 0.2 * price)
                }



                // things to do if this is vendor
                if (req.params.vendorID && req.session.vendorID) {
                    const customer = await Customer.findOne({
                        "customerID": detailedOrder.customerID
                    });

                    // no customer associated with order, just cancel it 
                    if (!customer){

                        var temp = await Order.findOne({'orderID': detailedOrder.orderID})
                        temp.status = "CANCELLED"

                        await temp.save()

                        return res.render('vendorError', 
                        {"issue": `This order appears to have issues. 
                                    <br>We have cancelled it  to prevent confusion
                                    as there appears to be no customer associated with it</br>`,
                        "redirectLink": `/vendor/${req.session.vendorID}/outstanding-orders`,
                        "solution": "Tap here to return to the previous page."})
                    
                        
                    }
                        

                    detailedOrder.customerName = customer.firstName;
                    if (detailedOrder.status == "ONGOING") detailedOrder.isOngoing = true;
                    else if (detailedOrder.status == "DELAYED") detailedOrder.isDelayed = true;
                    else if (detailedOrder.status == "FULFILLED") detailedOrder.isReady = true;
                    else if (detailedOrder.status == "COMPLETED") detailedOrder.isCompleted = true;
                    
                    return await res.render("vendorDetailedOrder", {
                        "detailedOrder": detailedOrder
                    })
                } else if (req.params.customerID && req.session.customerID) {
                    detailedOrder.subtotal = subtotal;
                    const discount = (+detailedOrder.discount * 0.2 * subtotal)
                    detailedOrder.total = subtotal - discount
                    return await res.render("detailedOrder", {
                        "detailedOrder": detailedOrder,
                        "discount": discount
                    })
                }
            }

        }
    } catch (err) {
        console.log(err)
        if (req.session.customerID) {
            return res.render("error", {
                "redirectLink": `/customer/${req.session.customerID}/orders`,
                "solution": "You can return to your orders page by clicking here."
            })
        } else {
            return res.render("vendorError", {
                "redirectLink": `/vendor/${req.session.vendorID}/outstanding-orders`,
                "solution": "You can return to your orders page by clicking here."
            })
        }
    }
}

// retrieves an order by a given status shown as an uppercase string
// ['COMPLETED','ONGOING', 'DELAYED', 'CANCELLED']
const retrieveOrderbyStatus = async (req, res) => {

    try {
        // retrieve by filter
        const orders = await Order.find({
            status: `${req.body.orderStatus}`.toUpperCase()
        })

        // no such orders exist yet (e.g. no delayed orders )
        if (orders.length == 0) {
            return res.send(`No orders of ${req.body.orderStatus} exist yet.`)
        }
        // otherwise return
        return res.send(orders)


    } catch (err) {
        res.status(400)
        return res.send(`Failed to query Order Database`)
    }
}

// assumes snacks will be in a form
// update by form
const addSnackToOrder = async (orderId, updatedSnackList, user, res) => {
    // check if customer first
    if (req.body.userType == "Customer") {

        //try to find if the order exists
        let customerOrder = await allOrders.find({
            $and: [{
                "customerID": user.body.userReferenceID,
                "orderId": orderId
            }]
        })

        // no orders found for that customer
        if (customerOrder === null) {
            res.status(400)
            return res.send("Order for that customer does not exist ")
        }

        // add snack to order
        // these will be of type orderItem
        // since theyre changed in the form we use to edit it, just replace the thing
        customerOrder.orderList = updatedSnackList

        // refresh time limit
        timeRemaining = timeLimit

        // try to save it
        try {
            let result = await customerOrder.save()
            return res.send(result)
        } catch (err) {
            res.status(400)
            return res.send("Failed to create new order")
        }
    } else {
        res.status(400)
        return res.send("User does not exist in customer database")
    }
}

// creates a new order
// implement after
const createOrder = (orderItem, customerID, vendorID, address) => {
    // create a new order here
    const newOrder = new Order({
        orderID: "3",
        orderList: [orderItem],
        discount: false,
        timeOrdered: new Date(),
        timeRemaining: timeLimit,
        customerID: customerID,
        vendorID: vendorID,
        status: "ONGOING",
        // refer to schema field
        pickupLocation: address

    })
    return newOrder
}

// Add a snack to order
const addOneSnackToOrder = async (req, res) => {
    try {
        // Check if snack exists by looking up snack database
        const snack = await Snack.findOne({
            "name": req.body.name
        })
        if (!snack) {
            res.status(400)
            return res.send("${req.body.name} is not a valid snack")
        }

        const newOrderItem = new orderItem({
            snackID: snack.snackID,
            quantity: 1,
            price: snack.price
        })

        // Check if customer exists in database
        const customer = await Customer.findOne({
            "customerID": req.body.customerID
        })

        if (!customer) {
            res.status(400)
            return res.send("${req.body.name} is not a valid customer")
        }

        // Check if vendor exists

        const vendor = await Vendor.findOne({
            "vendorID": req.body.vendorID
        })

        if (!vendor) {
            res.status(400)
            return res.send("${req.body.name} is not a valid vendor")
        }

        // Create order and add snack to list
        const newOrder = new Order({
            orderList: [newOrderItem],
            discount: false,
            timeOrdered: new Date(),
            timeRemaining: timeLimit,
            customerID: req.body.customerID,
            vendorID: req.body.vendorID,
            status: "ONGOING",
            // refer to schema field
            pickupLocation: vendor.address

        })

        try {
            newOrder.save()
            return res.send(`Added ${req.body.name} to your new order!`)

        } catch (err) {
            res.status(400)
            return res.send("Something wrong with the order creation")
        }

    } catch (err) {
        res.status(400)
        return res.send("Something went wrong with the order creation")
    }
}

// Remove a snack from order
const removeOneSnackFromOrder = async (req, res) => {
    Order.orderList.findOneAndDelete({
        "snackID": req.body.orderList.snackID
    }, function (err) {
        if (err) {
            res.status(400)
            return res.send("Failed to query Order database")
        }
    })
}

// create a new order entry based on the current cart
const addCartToOrder = async (req, res) => {
    // retrieve cart from post request
    var cookies = new Cookies(req, res) // smth for cookies.get to work

    // get our variables to creat the new order
    var cart = JSON.parse(req.body.cart)

    var customerID = req.session.customerID
    var vendorID = req.session.vendorID

    // try to create the order
    try {
        // find if theres a customer with that customerID
        const customer = await Customer.findOne({
            'customerID': customerID
        })
        if (!customer) {
            return res.sendStatus(400)
        }

        // // find if theres a vendor with that vendorID
        const vendor = await Vendor.findOne({
            "vendorID": vendorID
        })
        if (!vendor) {
            return res.sendStatus(503)
        }

        var listOfItems = [] // list of orderItems
        // for each item in the cart
        for (var item of cart) {
            // Check if snack exists by looking up snack database
            const snack = await Snack.findOne({
                "snackID": item.snackID
            })
            if (!snack) {
                res.status(400)
                return res.sendStatus(400)
                // print(`snack error on ${cart[item].snackID}`)
            }

            // create new order item
            const newOrderItem = new orderItem({
                snackID: snack.snackID,
                quantity: item.quantity,
                price: snack.price * item.quantity
            })
            listOfItems.push(newOrderItem)
        }

        var current = new Date();

        // Create order and add snack to list
        const newOrder = new Order({
            orderList: listOfItems,
            discount: false,
            timeOrdered: current.toLocaleString(),
            timeRemaining: timeLimit,
            customerID: customerID,
            vendorID: vendorID,
            status: "ONGOING",
            // refer to schema field
            pickupLocation: vendor.address

        })

        console.log(newOrder)

        // save order
        try {
            newOrder.save()
            return res.sendStatus(200)
            //return res.send('Added ${newOrder.orderList} to your new order!')


        } catch (err) {
            return res.sendStatus(500)
        }

    } catch (err) {
        return res.sendStatus(500)
    }

}

// check and apply discount if the time exceeds 15 minutes
const checkDiscount = async (order) => {
    // console.log("\n" + "CHECKING ORDERID: " + order.orderID + "\n");
    // something is wrong with Date.parse
    // if order.timeOrdered is in normal format (DD/MM/YYYY) then it will return NaN
    // american format (MM/DD/YYYY) seems to work just fine
    const orderDate = Date.parse(order.timeOrdered);
    // console.log("raw order date: " + order.timeOrdered);
    const curDate = new Date();
    // console.log("curDate : " + curDate)
    // console.log("orderDate : " + orderDate)
    const timeDiff = parseInt(curDate - orderDate);
    // console.log("timeDiff : " + timeDiff)
    const limit = timeLimit * 60000; // 15 minutes in miliseconds
    const distance = limit - timeDiff;
    // console.log("distance : " + distance)
    order.timeRemaining = Math.floor((distance / (1000 * 60)));
    // console.log("remaining : " + order.timeRemaining)
    // only do this for clean data
    if (order.orderList[0]==undefined || order.orderList[0].snackID == undefined) {
        console.log("OrderID: " + order.orderID + "HAS NO SNACKID");
        return false;
    }
    assert(order.orderList[0].snackID);
    if (['COMPLETED', 'DELAYED', 'FULFILLED'].includes(order.status)) {
        // console.log(("OrderID: " + order.orderID + "IS" + order.status));
        return false;
    }


    try {
        // if more than 15 minutes has passed
        if (timeDiff > limit) {
            order.discount = true;
            order.status = "DELAYED"
            await order.save();
            return true;
        }
        await order.save()
        return false;
    } catch (error) {
        console.log("failed");
        return false;
    }
}

const checkAllOrderStatus = async (req, res) => {
    try {
        const orders = await Order.find();
        assert(orders);
        for (var order of orders) {
            checkDiscount(order);
        }
        return true
    } catch (error) {
        console.error(error);
        return false
    }
}

// check if order can be edited/cancelled (within 10 mins)
const checkOrderEditable = async (order) => {
    const orderDate = Date.parse(order.timeOrdered);
    const curDate = new Date();
    const timeDiff = parseInt(curDate - orderDate);
    const tenMinutes = 10 * 60000; // 15 minutes in miliseconds

    try {
        // if more than 15 minutes has passed
        if (timeDiff > tenMinutes) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Can't check time for order to edit/cancel");
    }
}

const editOrder = async(req, res) => {
    try {

        const menu = await Snack.find().lean()

        const detailedOrder = await Order.findOne({
            "orderID": req.params.orderID
        }).lean()

        //is the person viewing the person who is supposed to see this
        if (req.session.customerID == undefined && req.params.customerID) {
            res.redirect('/customer/login')
        }
        // youre snooping go back
        else if (req.session.customerID != detailedOrder.customerID && req.params.customerID) {
            res.redirect(`/customer/${req.session.customerID}/orders`)
        }

        // order doesn't exist
        if (detailedOrder == null) {
            return res.render("error", {
                "issue": "The order you're looking for doesnt exist...",
                "redirectLink": `/customer/${req.session.customerID}/orders`,
                "solution": `You can return to your orders page by clicking here.`
            })
        }


        checkDiscount(await Order.findOne({
            "orderID": req.params.orderID
        }))

        var vendor = await Vendor.findOne({
            "vendorID": detailedOrder.vendorID
        });
        if (!vendor) return res.send("Failed to query Order database");


        detailedOrder.vendorName = vendor.vanName

        var subtotal = 0;

        // for each item in detailed order
        for (var item of detailedOrder.orderList) {
            var snack = await Snack.findOne({
                "snackID": item.snackID
            })
            if (!snack) {
                // failsafe if it returns object id
                snack = await Snack.findOne({
                    "_id": item.snackID
                })
            }
        }

        // otherwise everything ok
            checkDiscount(await Order.findOne({
                "orderID": req.params.orderID
            }))

            var vendor = await Vendor.findOne({
                "vendorID": detailedOrder.vendorID
            });

            detailedOrder.vendorName = vendor.vanName

            var subtotal = 0;

            // for each item in detailed order
            for (var item of detailedOrder.orderList) {
                // add on image

                var snack = await Snack.findOne({
                    "snackID": item.snackID

                })
                if (!snack) {

                    // failsafe if it returns object id
                    snack = await Snack.findOne({
                        "_id": item.snackID
                    })
                    if (!snack) {
                        return res.render("error", {
                            "redirectLink": `/customer/${req.session.customerID}/orders`,
                            "solution": "You can return to your orders page by clicking here."
                        })
                    }


                }

                item.image = snack.image
                item.name = snack.name
                subtotal += parseFloat(snack.price) * parseFloat(item.quantity)

            }

            detailedOrder.subtotal = subtotal;
            const discount = (+detailedOrder.discount * 0.2 * subtotal)
            detailedOrder.total = subtotal - discount
            if (req.params.vendorID) {
                const customer = await Customer.findOne({
                    "customerID": detailedOrder.customerID
                });
                if (!customer) return res.send("Failed to query Order database");
                detailedOrder.customerName = customer.firstName;
            }



            return await res.render("editOrder", {
                "detailedOrder": detailedOrder,
                "discount": discount,
                "menu": menu
            })
    } catch (err) {
        return res.render("error", {
            "redirectLink": `/customer/${req.session.customerID}/orders`,
            "solution": "You can return to your orders page by clicking here."
        })
    }
}



// customer cancels orders
const cancelOrder = async (req, res) => {
    try {
        // find order
        const order = await Order.findOne({
            "orderID": req.params.orderID
        })

        if (!order) {
            res.status(400)
            return res.send("Order does not exist")
        }

        if (checkOrderEditable(order)) {
            // Order found
            order.status = 'CANCELLED'

            let result = await order.save()
            return res.redirect("/customer/menu");
        }
    } catch (err) {
        console.error(err);
        res.status(400)
        return res.send("Unable to cancel order")
    }
}

// replace entire order list in the existing order
const updateOrder = async (req, res) => {
    // try to update the order
    try {
        console.log("START OF UPDATE ORDER");
        console.log(req.body)
        // find the current order
        var newData = JSON.parse(JSON.stringify(req.body))
        console.log(newData);
        var customerID = req.params.customerID
        var orderID = req.params.orderID

        const customer = await Customer.findOne({
            'customerID': customerID
        })
        if (!customer) {
            return res.sendStatus(400)
        }

        const order = await Order.findOne({
            'orderID': orderID
        })
        if (!order) {
            return res.sendStatus(400)
        }

        var listOfItems = []

        // var newOrderItem = new orderItem({
        //     snackID: newData['new_data[0][snackID]'],
        //     quantity: newData['new_data[0][quantity]'],
        //     price: newData['new_data[0][price]']
        //     //snackID: "1",
        //     //quantity: 3,
        //     //price: 10
        // })
        // listOfItems.push(newOrderItem)
        // console.log(newOrderItem);
        // console.log(listOfItems);
        var i;
        console.log("length" + newData.length)
        for (i=0; i< Object.keys(newData).length/3; i++) {
            // const snack = await Snack.findOne({
            //     "snackID": item.snackID
            // })
            // if (!snack) {
            //     res.status(400)
            //     return res.sendStatus(400)
            // }

            // create new order item
            var newOrderItem = new orderItem({
                snackID: newData['new_data[' + i + '][snackID]'],
                quantity: parseInt(newData['new_data[' + i + '][quantity]']),
                price: parseFloat(newData['new_data[' + i + '][price]'])
                // snackID: '1',
                // quantity: 3,
                // price: 10
            })
            console.log("snackID: " + newData['new_data[' + i + '][snackID]']);
            console.log("QUANTITY: " +parseInt(newData['new_data[' + i + '][quantity]']));
            console.log("price: " +parseFloat(newData['new_data[' + i + '][price]']));
            console.log(newOrderItem);
            listOfItems.push(newOrderItem)

        }

        // {
        //     'new_data[0][snackID]': '8',
        //     'new_data[0][quantity]': '4',
        //     'new_data[0][price]': '18'
        //   }

        var current = new Date();

        order.orderList = listOfItems
        order.discount = false
        // reset the date and timer
        order.timeOrdered = current.toLocaleString()

        console.log(order)
        console.log("END OF UPDATE ORDER");
        order.save()
        return res.redirect("OrderList")

    } catch (err) {
        console.log(err)
        return res.sendStatus(500)
    }

}


module.exports = {
    getOrderbyID,
    retrieveAllOutstandingOrders,
    retrieveOrderbyStatus,
    createOrder,
    updateOrder,
    retrieveOutstandingOrdersbyID,
    addOneSnackToOrder,
    removeOneSnackFromOrder,
    addSnackToOrder,
    addCartToOrder,
    retrieveAllOrders,
    viewCart,
    checkAllOrderStatus,
    retrievePastOrdersbyID,
    cancelOrder,
    editOrder
}