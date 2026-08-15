// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const express = require("express");
const {
  userRegisterController,
  userLoginControoler,
  userLogoutcontroller,
} = require("../controllers/auth.controllers");
const router = express.Router();

// ────────────────────────────────────────────────────────────────────────
//                          Routing Logic
// ────────────────────────────────────────────────────────────────────────

router.post("/register", userRegisterController);
router.post("/login", userLoginControoler);
router.post("/logout", userLogoutcontroller);

module.exports = router;
