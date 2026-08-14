// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────

const app = require("./src/app");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
dotenv.config();

const PORT = process.env.PORT;

// ────────────────────────────────────────────────────────────────────────
//                            Logic Statements
// ────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  // connectDB();
  console.log("Server running on ", PORT);
});
