import express from "express";
import cors from "cors";
import ConnectToDb from "./db/db.js";
const app = express();

ConnectToDb();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is alive");

  console.log("endpiint hiyt");
});

export default app;
