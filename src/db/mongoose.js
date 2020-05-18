/**
 * This file is now being changed for use in actual task app.
 * Now it is only meant for establishing the db connection
 * To see the version before this change, for mongoose ops understanding, checkout this commit: eb0a83e03b9c1dd6fb991d9e1ef8c53f54bf8c98
 */
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true, //--to be able to search our documents via index,
    useUnifiedTopology: true, //--added from the warning in console
    useFindAndModify: false //--mentioned in lecture 93
})
.then().catch(err => console.log("Connection error"))
