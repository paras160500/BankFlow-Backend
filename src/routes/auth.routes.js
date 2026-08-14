// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const express = require("express");
const {
  userRegisterController,
  userLoginControoler,
} = require("../controllers/auth.controllers");
const router = express.Router();

// ────────────────────────────────────────────────────────────────────────
//                          Routing Logic
// ────────────────────────────────────────────────────────────────────────

router.post("/register", userRegisterController);
router.post("/login", userLoginControoler);

module.exports = router;
