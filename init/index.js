const mongoose = require("mongoose");
require('dotenv').config( { path: "../.env"} );
const initData = require("./data.js");
const Listings = require("../models/listing.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const MONGO_URL = process.env.ATLASDB_URL;

main()
   .then(() => {
    console.log("connected to DB");
   })
   .catch((err) => {
    console.log(err);
   });

async function main() {
    await mongoose.connect(MONGO_URL);
};

const initDB = async () => {
    await Listings.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "68f4894a808674d0b99da396"}));
    await Listings.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();