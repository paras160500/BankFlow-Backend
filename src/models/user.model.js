// ────────────────────────────────────────────────────────────────────────
//                         Import/ Init Statements
// ────────────────────────────────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ────────────────────────────────────────────────────────────────────────
//                              Schema Defination
// ────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a user."],
      trim: true,
      lowercase: true,
      unique: [true, "Email already exists"],
      // match: [
      //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      //   "Please fill a valid email address",
      // ],
    },
    name: {
      type: String,
      required: [true, "Name is required for creating user."],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating user."],
      minlength: [6, "Password should be atleast 6 chars."],
      select: false, // We dont need password in anywhere
    },
  },
  {
    timestamps: true,
  },
);

// ────────────────────────────────────────────────────────────────────────
//                              Schema Validation
// ────────────────────────────────────────────────────────────────────────

// What happen while saving the userSchema to the database
userSchema.pre("save", async function (next) {
  // If the password is not changed
  if (!this.isModified("password")) {
    return next();
  }
  // If password change get the hash and then set it as password
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  return next();
});

// ────────────────────────────────────────────────────────────────────────
//                              Schema functions
// ────────────────────────────────────────────────────────────────────────

// For make our things easy making a compare function
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
