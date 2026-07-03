const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
const catchAsyncError = require('../utils/catchAsyncError');
const { type } = require('os');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide name'],
    maxLength: 40,
  },
  email: {
    type: String,
    required: [true, 'please provide email'],
    validate: [validator.isEmail, 'Email is invalid'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'please enter the password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // only works for create() and save()
      validator: function (el) {
        return el === this.password;
      },
      message: 'password did not match',
    },
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  twoFactorSecret: {
    type: String,
    select: false,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
});
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000;
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.createVerificationToken = async function () {};
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});
const User = mongoose.model('User', userSchema);
module.exports = User;
