/* THIS IS FOR THE MONGODB DATABASE
HELPS LINK OUR FILES TO MONGOOSE */

// this helps link our files to the mongoose thing 
require('dotenv').config()
const mongoose = require("mongoose")
const autoIncrement = require("mongoose-auto-increment")

// Connect to MongoDB - database login is retrieved from environment variables - YOU SHOULD
//USE YOUR OWN ATLAS CLUSTER
CONNECTION_STRING ="mongodb+srv://<username>:<password>@cluster0.yhftc.mongodb.net/CCB?retryWrites=true&w=majority"

// takes stuff from your env file and pastes it here
// the .env file can also be used to store other esensitive vars
MONGO_URL = CONNECTION_STRING.replace("<username>",process.env.MONGO_USERNAME).replace("<password>",process.env.MONGO_PASSWORD)


// connect to the DB
mongoose.connect(MONGO_URL || "mongodb://localhost", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "CCB"
})

// connection parts 
const db = mongoose.connection
// intialise auto-increment
autoIncrement.initialize(db)


// error handling
db.on("error", err => {
    console.error(err);
    process.exit(1)
})

// remember async? here we try to establish a connection with the file we are connecting with 
db.once("open", async () => {
    console.log("Mongo connection started on " + db.host + ":" + db.port)
    console.log(`${process.env.MONGO_USERNAME} has connected successfully`)
})


// this will import all of our schemas
require("./snacks")
require("./order")
require("./user")