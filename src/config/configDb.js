const mongoose = require("mongoose");
module.exports = async () => {

    //C1: try catch async await
    // try {
    //     await mongoose.connect(process.env.DB_LOCAL);
    //     console.log("connected to DB!")
    // } catch (error) {
    //     console.log("connected fail !");
    // }


    //C2: promise
    mongoose.connect(process.env.DB_LOCAL)
        .then(() => console.log("connected to DB!"))
        .catch(error => console.log("connected fail !"))
};