import {config} from '../config';
import {UserModel} from './User';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    jwt = require('jwt-simple');


let Token = new Schema({
    token: {type: String},
    date_created: {type: Date, default: Date.now},
});

Token.statics.hasExpired = (created) => {
  let now = new Date();
  let diff = (now.getTime() - created);
  return diff > config.tll;
};

let TokenModel = mongoose.model('Token', Token);

let UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    first: String,
    last: String
  },
  date_created: {type: Date, default: Date.now},
  token: {type: Object},
  //For reset we use a reset token with an expiry (which must be checked)
  register_token: {type: String},
  register_token_expires_millis: {type: Number}
});

UserSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

//add all the virtuals at the start
UserSchema.virtual('fullname').get(function() {
  return this.name.first + ' ' + this.name.last;
});

UserSchema.virtual('user_token').get(function() {
  return this.token.token;
});

//create common functions that are used by the actual data setting methods
UserSchema.statics.encode = (data) => {
  return jwt.encode(data, config.jwtSecret);
};

UserSchema.statics.decode = (data) => {
  return jwt.decode(data, jwtSecret);
};

//need to use dunction rather than fat arrow since babel makes this object to undefined when compliled
UserSchema.statics.findUser = function (email, token, cb) {
  let self = this;
   this.findOne({email:email}, (err, user) => {
     if (err) cb(err, null);
     if(user && ((user.token && user.token.token === token) || !token)) cb(null, user);
   });
};

const tokendata = (user) => {
  return {
    email: user.email,
    id: user._id,
    username: user.fullname
  }
};

UserSchema.methods.createToken = function () {
  let self = this;
  self.token = new TokenModel({token: this.model('User').encode(tokendata(self))});
  self.save();
};

mongoose.model('User', UserSchema);
