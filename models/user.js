let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
  firstName: { type: String, required: true, max: 50 },
  lastName: { type: String, required: true, max: 50 },
  email: { type: String },
  fbId: { type: String },
  password: { type: String, min: 5 },
  friends: [{ type: String }],
  friendRequests: [{ type: String }],
  picture: { type: String, required: false, default: 'https://res.cloudinary.com/kikupiku/image/upload/v1592919291/fakebook/default-user_s7rozl.png' },
  gallery: [{ type: String }],
});

UserSchema
.virtual('fullName')
.get(function () {
  return this.firstName + ' ' + this.lastName;
});

UserSchema
.virtual('url')
.get(function () {
  return '/users/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
