require("dotenv").config();
const express = require("express");
const cors = require("cors");
const client = require("./config/pgConfig");
const maintainerRoute = require("./routes/maintainers");
const eventRoute = require("./routes/events");
const participantRoute = require("./routes/participant");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const start = async () => {
  await client.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db!");
    app.listen(port, (err) => {
      if (err) throw err;
      console.log(`App running on port ${3000}`);
    });
  });
};

app.use("api/v1/participants", participantRoute);
// for login , register , add selected events , remove events ,show participating evnets

app.use("api/v1/events", eventRoute);
// for listing all events , evnet dates and participation count and all

app.use("api/v1/maintainers", maintainerRoute);
// for listing all events , evnet dates and participation count and all

start();
