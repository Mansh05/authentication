'use strict';
import {config} from './config';
import {controllers} from './controllers';

let express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose');

/**
* middlewares
*/
mongoose.connect(config.mongoURL);
mongoose.connection.on('error', (err) => {
    console.log('Mongo connection error', err.message);
});
mongoose.connection.once('open',() => {
    console.log("Connected to MongoDB");
});

app.use(passport.initialize());

require('./models');

let User = mongoose.model('User');

passport.use(User.createStrategy());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

controllers(app);
//require('./contollers')(app, passport);

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

app.listen(config.port, () => {
  console.log('Connected to the port');
});
