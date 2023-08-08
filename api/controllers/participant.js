const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nanoid = require("nanoid");
const client = require("../config/pgConfig");
const expressAsyncHandler = require("express-async-handler");

const registerParticipant = expressAsyncHandler(async (req, res) => {
  const { name, email, institute } = req.body;

  const isInParticipant = await client.query(
    `select * from participants where email='${email}'`
  );
  if (isInParticipant.rowCount != 0) {
    return res
      .status(403)
      .send("Email already exists, Login to check profile.");
  }

  const id = nanoid(15);
  const password = await bcrypt.hash(req.body.password, 10);

  const queryText = `insert into participants(email,name,institute,id,password) values ('${email}','${name}','${institute}','${id}','${password}')`;

  await client.query(queryText);
  res.status(200).json({
    message: "Congrats you have successfully registered as a Participant.",
    id,
  });
});

const loginParticipatant = expressAsyncHandler(async (req, res) => {
  const { password, email, id } = req.body;

  const checkMail = await client.query(
    `select * from participants where email='${email}' and id='${id}'`
  );
  // console.log(checkMail);
  if (checkMail.rowCount === 0) {
    return res.status(403).send("Please register as a participant first.");
  }
  const details = checkMail.rows[0];
  const comparePass = await bcrypt.compare(password, details.password);
  if (!comparePass) {
    return res.status(401).send("Incorrect Password. Try again.");
  }
  const token = jwt.sign(
    {
      name: details.name,
      institute: details.institute,
    },
    process.env.SECRET,
    { expiresIn: "15h" }
  );
  res.status(200).json({
    message: "User successfully signed In.",
    id,
    email,
    token,
  });
});

const addEventsParticipating = expressAsyncHandler(async (req, res) => {
  const { email, eventId, id } = req.body;
  //check if event already present in array
  const checkIfAlreadyPresent = await client.query(`SELECT EXISTS (
    SELECT 1
    FROM participants
    WHERE '${eventId}' = ANY(events) and id='${id}'
  );`);
  if (checkIfAlreadyPresent.rows[0].exists == true) {
    return res.status(401).send("You are already a participant in this event.");
  }
  //check eventt in eventdb;
  const checkEvent = await client.query(
    `select * from events where id='${eventId}'`
  );

  if (checkEvent.rows.length === 0)
    return res.status(404).send("Event not present in Database.");
  //add event to participants
  try {
    await client.query(`UPDATE participants
    SET events = ARRAY_APPEND(events, '${eventId}') 
    WHERE email='${email}';`);

    await client.query(`UPDATE events
    SET participantCount = participantCount + 1
    WHERE id='${eventId}';`);
    return res.status(200).send("Event added successfully. Check profile.");
  } catch (error) {
    console.log(error);
  }
});

const removeEventsParticipating = expressAsyncHandler(async (req, res) => {
  const { email, eventId, id } = req.body;
  const checkIfAlreadyPresent = await client.query(`SELECT EXISTS (
    SELECT 1
    FROM participants
    WHERE '${eventId}' = ANY(events) and id='${id}'
  );`);
  if (checkIfAlreadyPresent.rows[0].exists == false) {
    return res.status(401).send("You are not a participant in this event.");
  }
  try {
    // see count of participants
    await client.query(`UPDATE participants
    SET events = ARRAY_REMOVE(events, '${eventId}') 
    WHERE email='${email}';`);
    //change count of event in event db
    await client.query(`UPDATE events
    SET participantCount = participantCount - 1
    WHERE id='${eventId}';`);
    return res.status(200).send("Event removed successfully. Check profile.");
  } catch (error) {
    console.log(error);
  }
});

const participantProfileData = expressAsyncHandler(async (req, res) => {
  const { id } = req.body;
  const checkId = await client.query(
    `select * from participants where id='${id}'`
  );
  // roll : 2021-IMT-004
  if (checkId.rowCount == 0) {
    return res.status(404).send("Enter Proper Roll");
  }
  const details = checkId.rows[0];
  return res.status(200).json({
    eventCount: details.events.length,
    email: details.email,
    DOB: details.DOB,
    events: details.events,
  });
});

module.exports = {
  registerParticipant,
  loginParticipatant,
  participantProfileData,
  removeEventsParticipating,
  addEventsParticipating,
};
