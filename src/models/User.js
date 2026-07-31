const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const { _id, name, email, role, createdAt } = this;
  return { _id, name, email, role, createdAt };
};

module.exports = mongoose.model('User', userSchema);
