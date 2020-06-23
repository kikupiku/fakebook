let User = require('../models/user');
let Post = require('../models/post');
let Comment = require('../models/comment');

let async = require('async');
const { body, validationResult } = require('express-validator');
const passport = require('../passport');
const bcrypt = require('bcryptjs');

exports.timeline = function (req, res, next) {
  if (req.user) {
    res.render('timeline', { title: 'Fakebook', currentUser: req.user });
  } else {
    res.render('signup-login', { title: 'Fakebook' });
  }
};

exports.find_friends_get = function (req, res, next) {

};

exports.user_create_post = [
  body('firstName')
  .trim()
  .isLength({ min: 1 })
  .withMessage('Please enter your first name')
  .escape(),

  body('lastName')
  .trim()
  .isLength({ min: 1 })
  .withMessage('You cannot leave your last name empty')
  .escape(),

  body('email')
  .trim()
  .isEmail()
  .withMessage('It has to be a real email address'),

  body('password')
  .trim()
  .isLength({ min: 5 })
  .withMessage('Your password needs to be at least 5 characters long'),

  (req, res, next) => {

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }

      const errors = validationResult(req);

      let user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        picture: (!req.file) ? 'https://res.cloudinary.com/kikupiku/image/upload/v1592919291/fakebook/default-user_s7rozl.png' : req.file.path,
      });

      if (!errors.isEmpty()) {
        res.status(400).redirect('/', { errors: errors.array() });
      } else {
        user.save(err => {
          if (err) {
            return next(err);
          }

          req.login(user, function(err) {
            if (err) { return next(err); }
            return res.render('profile', { title: 'User Profile', currentUser: req.user });
          });

        });
      }
    });
  },
];

exports.user_delete = function (req, res, next) {

};

exports.user_update_get = function (req, res, next) {

};

exports.user_update_put = [

  (req, res, next) => {

  },
];

exports.user_profile_get = function (req, res, next) {

};

exports.friend_requests_get = function (req, res, next) {

};

exports.friend_list_get = function (req, res, next) {

};
