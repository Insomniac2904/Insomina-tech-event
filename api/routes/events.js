const express = require("express");
const {
  getAll,
  getRemaining,
  getEventDetails,
} = require("../controllers/events");
const router = express.Router();

router.route("/getAll").get(getAll);
router.route("/getRemaining").get(getRemaining);
router.route("/getDetails").get(getEventDetails);
module.exports = router;
