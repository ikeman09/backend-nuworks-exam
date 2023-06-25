const mongoose = require('mongoose')

const connectToDatabase = async () => {
  // Connect to mongodb
  const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}`
  mongoose.set("strictQuery", true);
  return await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000 // Keep trying to send operations for 5 seconds
  })
}

module.exports = connectToDatabase
