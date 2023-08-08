const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/pgConfig");
const asyncHandler = require("express-async-handler");

const registerMaintainers = asyncHandler(async (req, res) => {
  const roll = req.body.roll.trim();
  const name = req.body.name.trim();
  const DOB = req.body.DOB;
  const email = req.body.email;

  const isInInstituteDB = await client.query(
    `select *
      from institutedb
      where roll='${roll}' and name='${name}' and DOB='${DOB}';`
  );
  // console.log(isInInstituteDB.rowCount);
  // console.log(isInInstituteDB);
  if (isInInstituteDB.rowCount == 0) {
    res
      .status(404)
      .send(
        "No student with above details found in InstituteDB. Try agian or Contact Institue Admininstration"
      );
  } else {
    const isMaintainerRegistered = await client.query(
      `select *
        from maintainers
        where roll='${roll}';`
    );
    // console.log(isMaintainerRegistered);
    if (isMaintainerRegistered.rowCount !== 0) {
      res
        .status(201)
        .send("Roll already regsiterd as maintainer, Login to check profile.");
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const password = hash;
      try {
        const queryText = `insert into maintainers(roll,email,name,password,DOB) values ('${roll}','${email}','${name}','${password}','${DOB}')`;
        await client.query(queryText);
        res
          .status(200)
          .send(
            "You have successfully Registered as a maintainer. Add events."
          );
      } catch (error) {
        console.log(error);
        error.stack;
      }
    }
  }
  // console.log(password);
});

const loginMaintainer = async (req, res) => {
  const password = req.body.password;
  const roll = req.body.roll;

  const checkRoll = await client.query(
    `select * from maintainers where roll='${roll}'`
    // roll : 2021-IMT-004
  );
  // console.log(checkRoll);
  if (checkRoll.rowCount === 0) {
    res.status(403).send("Please register as a maintainer first.");
  } else {
    // console.log(checkRoll);
    const details = checkRoll.rows[0];
    const compPass = await bcrypt.compare(password, details.password);
    if (!compPass) {
      res.status(401).send("Incorrect Password. Try again.");
    }
    const { email, roll } = details;
    const token = jwt.sign(
      {
        email,
        roll,
      },
      process.env.SECRET,
      { expiresIn: "15h" }
    );
    res.status(200).json({
      message: "User signed In.",
      email,
      token,
    });
  }
};

const AddEventsMaintaining = async (req, res) => {
  const { roll, eventId } = req.body;
  //check if event is already present in array of maintainer
  const checkIfAlreadyPresent = await client.query(`SELECT EXISTS (
    SELECT 1
    FROM maintainers
    WHERE '${eventId}' = ANY(events) and roll='${roll}'
);`);
  if (checkIfAlreadyPresent.rows[0].exists == true) {
    return res.status(401).send("You are already a maintainer of this event.");
  } else {
    //check event in eventdb;
    const checkEvent = await client.query(
      `select * from events where id='${eventId}'`
    );
    if (checkEvent.rows.length === 0)
      return res.status(404).send("Event not present in Database.");
    //add event to participants
    else {
      try {
        await client.query(`update maintainers
    SET events = ARRAY_APPEND(events, '${eventId}')
    WHERE roll='${roll}';`);
        //add miantainer id to maintainers array in evets
        await client.query(`UPDATE events
    SET maintainers = ARRAY_APPEND(maintainers, '${roll}')
    WHERE id='${eventId}';`);
        res.status(200).send("Event added successfully. Check profile");
      } catch (error) {
        console.log(error);
      }
    }
  }
};

const DeleteEventsMaintaining = async (req, res) => {
  const { roll, eventId } = req.body;
  const checkIfAlreadyPresent = await client.query(`SELECT EXISTS (
    SELECT 1
    FROM maintainers
    WHERE '${eventId}' = ANY(events) and roll='${roll}'
);`);
  if (checkIfAlreadyPresent.rows[0].exists == false) {
    return res.status(404).send("You are not a maintainer of this event.");
  }
  try {
    await client.query(`UPDATE maintainers
    SET events = ARRAY_REMOVE(events, '${eventId}') 
    WHERE roll='${roll}';`);

    await client.query(`UPDATE events 
    SET maintainers = ARRAY_REMOVE(maintainers, '${roll}')
    WHERE id='${eventId}';`);
    return res.status(200).send("Event removed successfully. Check profile.");
  } catch (error) {
    console.log(error);
  }
};

const MaintainerData = async (req, res) => {
  const roll = req.body.roll;
  const checkRoll = await client.query(
    `select * from maintainers where roll='${roll}'`
  );
  if (checkRoll.rowCount === 0) {
    res.status(404).send("Roll Not Found");
  }
  const { email, events } = checkRoll.rows[0];
  res.status(200).json({
    roll,
    email,
    events,
  });
};

module.exports = {
  registerMaintainers,
  loginMaintainer,
  AddEventsMaintaining,
  MaintainerData,
  DeleteEventsMaintaining,
};
