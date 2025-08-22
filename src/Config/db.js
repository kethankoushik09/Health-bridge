const mongoose = require("mongoose");

const connectdb = async() =>{
    mongoose.connect(process.env.MONGODB_URL)
}

module.exports = connectdb;