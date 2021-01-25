const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required!'],
    minlength: [3, 'Name must be atleast 3 characters long!'],
    maxlength: [20, "Name can't be more than 20 characters long!"],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is reqired!'],
    unique: true,
    validate: [validator.isEmail, 'Invalid Email address!'],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    select: false,
    required: [true, 'Password is required!'],
    minlength: [8, 'Password needs to be 8 to 16 characters long!'],
    maxlength: [16, 'Password needs to be 8 to 16 characters long!']
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
