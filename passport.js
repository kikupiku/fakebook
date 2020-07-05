const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('./models/user');

let bcrypt = require('bcryptjs');

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  function (username, password, done) {
    User.findOne({ email: username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect email' });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        console.log('compared data: ', err, res);
        if (res) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password' });
        }
      });
    });
  }
));


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['email', 'name', 'id', 'picture.type(large)']
  },
  function(accessToken, refreshToken, profile, done) {
    const { email, first_name, last_name, id, photos } = profile._json;
    User.findOne({ 'fbId': id })
    .exec(function (err, user) {
      if (user) {
        done(null, user);
      } else {
        let user = new User({
          firstName: first_name,
          lastName: last_name,
          fbId: id,
          email,
          friends: [],
          friendRequests: [],
          picture: profile.photos ? profile.photos[0].value : 'https://res.cloudinary.com/kikupiku/image/upload/v1592919291/fakebook/default-user_s7rozl.png',
          gallery: profile.photos ? [profile.photos[0].value] : [],
        }).save();
        done(null, user);
      }
    });
  })
);

module.exports = passport;
