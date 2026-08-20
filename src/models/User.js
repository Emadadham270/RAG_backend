/**
 * User.js
 * Mongoose model for application users.
 *
 * Responsibilities:
 *  - Database schema and field definitions
 *  - Field-level constraints (required, unique, etc.)
 *  - Password hashing (pre-save hook — close to the data)
 *  - Instance helper for password comparison
 *
 * Business logic (e.g. registration flow, JWT issuance)
 * belongs in authService.js, NOT here.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method — kept here because it is tightly coupled to the schema
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
