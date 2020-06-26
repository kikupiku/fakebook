let User = require('../models/user');
let Post = require('../models/post');
let Comment = require('../models/comment');

let async = require('async');
const { body, validationResult } = require('express-validator');
const passport = require('../passport');
const bcrypt = require('bcryptjs');

exports.timeline = function (req, res, next) {
  if (req.user) {
    Post.find({ $or: [{ 'author': req.user._id }, { 'author': { '$in': req.user.friends } }] })
    .sort('-createdAt')
    .populate('author')
    .exec(function (err, postsOfFriends) {
      if (err) {
        return next(err);
      }
      res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends });
    });
  } else {
    let errors = req.flash('error');
    console.log('errors of login: ', errors);
    res.render('signup-login', { title: 'Fakebook', errors: errors });
  }
};

exports.find_friends_get = function (req, res, next) {
  let userAsArray = [req.user._id];
  let userAndTheirFriends = req.user.friends.concat(userAsArray);
  User.find({ '_id': { '$nin': userAndTheirFriends } })
  .sort([['firstName', 'ascending']])
  .exec(function(err, potentialFriends) {
    if (err) {
      return next(err);
    }

    res.render('findFriends', { title: 'Find Friends', potentialFriends: potentialFriends, currentUser: req.user });
  });
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
        friends: [],
        friendRequests: [],
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
            Post.find({ 'author': { '$in': req.user.friends }, 'author': req.user._id })
            .sort('-createdAt')
            .exec(function (err, postsOfFriends) {
              if (err) {
                return next(err);
              }
              res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends });
            });
          });

        });
      }
    });
  },
];

exports.user_login = [
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
  }),
];

exports.user_logout_get = function (req, res, next) {
  req.logout();
  res.redirect('/');
};

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
  User.find({ '_id': { '$in': req.user.friendRequests }})
  .sort([['firstName', 'ascending']])
  .exec(function (err, potentialFriends) {
    if (err) {
      return next(err);
    }

    res.render('friendRequests', { title: 'Friend Requests', potentialFriends: potentialFriends, currentUser: req.user });
  });
};

exports.friend_list_get = function (req, res, next) {
  User.find({ '_id': { '$in': req.user.friends }})
  .sort([['firstName', 'ascending']])
  .exec(function (err, friends) {
    if (err) {
      return next(err);
    }

    res.render('myFriends', { title: 'My Friends', friends: friends, currentUser: req.user });
  });
};

exports.request_friendship_post = [
  (req, res, next) => {
    User.findById(JSON.parse(req.body.potentialFriend)._id)
    .exec(function(err, potentialFriend) {
      if (err) {
        return next(err);
      }

      console.log('potentsch: ', potentialFriend.friendRequests);
      console.log('currentUserId: ', req.user._id);

      let user = new User({
        firstName: potentialFriend.firstName,
        lastName: potentialFriend.lastName,
        email: potentialFriend.email,
        password: potentialFriend.password,
        friends: potentialFriend.friends,
        friendRequests: potentialFriend.friendRequests.concat([req.user._id]),
        picture: potentialFriend.picture,
        _id: potentialFriend._id,
      });

      console.log('updatedUser: ', user.friendRequests);
      User.findByIdAndUpdate(potentialFriend._id, user, {}, function (err, updatedUser) {
        res.redirect('/users');
      });
    });
  },
];

exports.request_accept_post = [
  (req, res, next) => {
    User.findById(JSON.parse(req.body.potentialFriend)._id)
    .exec(function (err, newFriend) {
      if (err) {
        return next(err);
      }

      console.log('making sure who is my new friend: ', newFriend);
      console.log('req.user.friendRequests: ', req.user.friendRequests);
      let requestsReduced = req.user.friendRequests.filter((val => val != newFriend._id));
      console.log('req.user.id: ', req.user._id, typeof req.user._id);
      console.log('requestsReduced: ', requestsReduced);

      let friend = new User({
        firstName: newFriend.firstName,
        lastName: newFriend.lastName,
        email: newFriend.email,
        password: newFriend.password,
        friends: newFriend.friends.concat([req.user._id]),
        friendRequests: newFriend.friendRequests,
        picture: newFriend.picture,
        _id: newFriend._id,
      });

      console.log('friend: ', friend);

      let user = new User({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        password: req.user.password,
        friends: req.user.friends.concat([newFriend._id]),
        friendRequests: requestsReduced,
        picture: req.user.picture,
        _id: req.user._id,
      });

      console.log('user: ', user);

      User.findByIdAndUpdate(newFriend._id, friend, {}, function (err, updatedFriend) {
        User.findByIdAndUpdate(req.user._id, user, {}, function (err, updatedUser) {
          res.redirect('/users/' + req.user._id + '/friend-list');
        });
      });
    })
  },
];

exports.request_decline_post = [
  (req, res, next) => {

  },
];
