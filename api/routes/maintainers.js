const {
  registerMaintainers,
  loginMaintainer,
  MaintainerData,
  AddEventsMaintaining,
  DeleteEventsMaintaining,
} = require("../controllers/maintainers");

const express = require("express");
const authVerify = require("../middleware/authVerify");
const router = express.Router();
router.route("/register").post(registerMaintainers);
router.route("/login").post(loginMaintainer);
router.route("/add").put(authVerify, AddEventsMaintaining);
router.route("/remove").put(authVerify, DeleteEventsMaintaining);
router.route("/profile").get(authVerify, MaintainerData);
module.exports = router;
