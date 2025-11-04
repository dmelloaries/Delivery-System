import mongoose from "mongoose";

function ConnectToDb() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to Mongo DB");
    })
    .catch((err) => {
      console.log("Error Connecting ", err);
    });
}

export default ConnectToDb;
