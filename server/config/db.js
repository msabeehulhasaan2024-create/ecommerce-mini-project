const mongoose = require('mongoose');

const connectDB = async () => {
  return mongoose
    .connect("mongodb+srv://msabeehulhasaan2024_db_user:3KmvTYUq1khzEyAz@cluster0.2tsjx3u.mongodb.net/?appName=Cluster0")
    .then(() => {
      console.log(`MongoDB Connected successfully`);
    })
    .catch((error) => {
      console.error(error);
      console.log("MongoDB not connected");
    });
};

module.exports = { connectDB };
