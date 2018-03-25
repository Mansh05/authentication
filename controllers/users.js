import {config} from '../config';

let mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Token = mongoose.model('Token'),
    passport = require('passport');

let newUser = (user) => {
    return new User({email: user.email, name: user.name});
};

module.exports = function (app) {

  app.post('/register', function (req, res, next) {
    User.register(newUser(req.body), req.body['password'],(error, usr) => {
      if (error) {
        if(error.name === 'UserExistsError' && error.message) {
          res.status(401).send(error.message);
        } else {
          res.status(404).send('Bad Request');
        }
      } else {
        usr.createToken();
        res.json({user: usr});
      }
    });
  });

  app.post('/login',passport.authenticate('local', {session: false}), function(req, res){
    if (req.user) res.send(req.user);
  });

}
