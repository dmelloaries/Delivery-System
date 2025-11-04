import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is alive");

  console.log("endpiint hiyt");
});

export default app;
