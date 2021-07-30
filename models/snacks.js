const mongoose = require("mongoose")

const snackSchema = new mongoose.Schema({
    snackID: {type: String, required: true}, // refer to order schema
    name: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true}
},
// MOST IMPORTANT PART 
// this will refer to the actual mongoDB collection name
{collection: 'Snacks'})

const Snack = mongoose.model("Snack", snackSchema)

module.exports = Snack