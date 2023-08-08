const client = require("../config/pgConfig");

const getAll = async (req, res) => {
  try {
    const allEvents = await client.query(`select * from events`);
    if (allEvents.rows.lenght === 0) res.status(401).send("No events present.");
    res.status(200).send(allEvents.rows);
  } catch (error) {
    console.log(error);
    error.stack;
  }
};

const getEventDetails = async (req, res) => {
  const eventId = req.body.eventID;
  try {
    const details = await client.query(
      `select * from events where id ='${eventId}'`
    );
    if (details.rows.length === 0)
      res.status(200).send("No events of this ID present in Database");
    res.status(200).send(details.rows);
  } catch (error) {
    console.log(error);
    error.stack;
  }
};

const getRemaining = async (req, res) => {
  try {
    const allEvents = await client.query(
      `select * from events where date > NOW()`
    );
    if (allEvents.rows.length === 0)
      res.status(404).send("No events remaining");
    res.status(200).send(allEvents.rows);
  } catch (error) {
    console.log(error);
    error.stack;
  }
};

module.exports = { getAll, getRemaining, getEventDetails };
