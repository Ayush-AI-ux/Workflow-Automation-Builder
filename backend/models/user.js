// // src/models/User.js
// // const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// // const UserSchema = new mongoose.Schema({
// //   email: { type: String, required: true, unique: true, lowercase: true },
// //   passwordHash: { type: String },
// //   name: { type: String },
// //   createdAt: { type: Date, default: Date.now }
// // });
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// });




// // set password
// UserSchema.methods.setPassword = async function(password) {
//   const salt = await bcrypt.genSalt(10);
//   this.passwordHash = await bcrypt.hash(password, salt);
// };

// // validate password
// UserSchema.methods.validatePassword = async function(password) {
//   if (!this.passwordHash) return false;
//   return bcrypt.compare(password, this.passwordHash);
// };

// // module.exports = mongoose.model('User', UserSchema);
// // ✅ Prevent model overwrite on hot reload (nodemon)
// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Prevent Mongoose model overwrite during hot reload
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);