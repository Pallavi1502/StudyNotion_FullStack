const mongoose= require("mongoose");
require("dotenv").config();

exports.connect = async () => {
    await mongoose.connect(process.env.MONGODB_URL)
    .then( () => console.log("DB conneceted successfully") )
    .catch( (error) => {
        console.log("DB connection failed");
        console.error(error);
        process.exit(1);
    } )
};