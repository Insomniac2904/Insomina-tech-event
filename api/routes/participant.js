const express = require("express");
const router = express.Router();
const {
  registerParticipant,
  loginParticipatant,
  participantProfileData,
  removeEventsParticipating,
  addEventsParticipating,
} = require("../controllers/participant");
const authVerify = require("../middleware/authVerify");

router.route("/register").post(registerParticipant);
router.route("/login").post(loginParticipatant);
router.route("/add").put(authVerify, addEventsParticipating);
router.route("/remove").put(authVerify, removeEventsParticipating);
router.route("/profile").get(authVerify, participantProfileData);

module.exports = router;
