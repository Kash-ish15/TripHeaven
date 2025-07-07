const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const dbURL = "mongodb://127.0.0.1:27017/tripheaven";

async function main() {
  try {
    await mongoose.connect(dbURL);
    console.log("DB connected successfully");
    await init(); // Call init only after connection is established
  } catch (err) {
    console.error("Connection error:", err);
  }
}

const init = async () => {
  try {
    // Delete existing data
    const deleteResult = await Listing.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} listings`);
    
    // Insert new data
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"68568cf561ddbf1622ca7396"}));
    const insertResult = await Listing.insertMany(initdata.data);
    console.log(`Inserted ${insertResult.length} listings`);
    
    // Verify count
    const count = await Listing.countDocuments();
    console.log(`Total listings now: ${count}`);
  } catch (err) {
    console.error("Initialization error:", err);
  }
};

main();
