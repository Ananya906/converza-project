require("dotenv").config();

const mongoose = require("mongoose");
const Event = require("./models/Event");
const mockEvents = require("./models/mockEvents");

mongoose.connect(process.env.MONGO_URI);

async function seedData() {
  try {
    const cleanedEvents = mockEvents.map(({ _id, ...rest }) => rest);

    await Event.insertMany(cleanedEvents);

    console.log("✅ Events inserted into DB");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedData();