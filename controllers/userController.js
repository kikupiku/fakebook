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

      console.log('req.user: ', req.user);

      let IdsOfPostsOfFriends = postsOfFriends.map(post => post._id);
      Comment.find({ 'post': { '$in': IdsOfPostsOfFriends } })
      .sort('createdAt')
      .populate('commenter')
      .exec(function (err, commentsToPostsOfFriends) {
        if (err) {
          return next(err);
        }

        if (req.body.postToEditId) {
          Post.findById(req.body.postToEditId)
          .exec(function (err, postToEdit) {
            if (err) {
              return next(err);
            }
            res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends, postToEdit });
          });
        } else if (req.body.commentToEditId) {
          Comment.findById(req.body.commentToEditId)
          .exec(function (err, commentToEdit) {
            if (err) {
              return next(err);
            }
            res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends, commentToEdit });
          })
        } else {
          res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends });
        }
      });
    });
  } else {
    let errors = req.flash('error');
    res.render('signup-login', { title: 'Fakebook', errors: errors });
  }
};

exports.timelinePOST = function (req, res, next) {
  if (req.user) {
    Post.find({ $or: [{ 'author': req.user._id }, { 'author': { '$in': req.user.friends } }] })
    .sort('-createdAt')
    .populate('author')
    .exec(function (err, postsOfFriends) {
      if (err) {
        return next(err);
      }

      let IdsOfPostsOfFriends = postsOfFriends.map(post => post._id);
      Comment.find({ 'post': { '$in': IdsOfPostsOfFriends } })
      .sort('createdAt')
      .populate('commenter')
      .exec(function (err, commentsToPostsOfFriends) {
        if (err) {
          return next(err);
        }

        if (req.body.postToEditId) {
          Post.findById(req.body.postToEditId)
          .exec(function (err, postToEdit) {
            if (err) {
              return next(err);
            }
            res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends, postToEdit });
          });
        } else if (req.body.commentToEditId) {
          Comment.findById(req.body.commentToEditId)
          .exec(function (err, commentToEdit) {
            if (err) {
              return next(err);
            }
            res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends, commentToEdit });
          })
        } else {
          res.render('timeline', { title: 'Timeline', currentUser: req.user, postsOfFriends: postsOfFriends, commentsToPostsOfFriends: commentsToPostsOfFriends });
        }
      });
    });
  } else {
    let errors = req.flash('error');
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

exports.user_delete_get = function (req, res, next) {
  res.render('userDelete', { title: 'Delete Account', currentUser: req.user });
};

exports.user_delete_post = function (req, res, next) {
  // to delete: user, their posts, comments, commentstotheirposts, friendships, requests
  User.findById(req.body.userToDeleteId)
  .exec(function (err, userToDelete) {

    async.parallel({
      postsOfUser: function (callback) {
        Post.find({ 'author': userToDelete })
        .exec(callback);
      },
      commentsOfUser: function (callback) {
        Comment.find({ 'commenter': userToDelete })
        .exec(callback);
      },
      friendsOfUser: function (callback) {
        User.find({ friends: userToDelete._id })
        .exec(callback);
      },
      friendshipsRequestedByUser: function (callback) {
        User.find({ friendRequests: userToDelete._id })
        .exec(callback);
      },
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      Comment.find({ 'post': { '$in': results.postsOfUser } })
      .exec(function (err, commentsToPostsOfUser) {
        if (err) {
          return next(err);
        }

        let postIds = results.postsOfUser.map(post => post._id);
        let userCommentIds = results.commentsOfUser.map(comment => comment._id);
        let commentIds = commentsToPostsOfUser.map(comment => comment._id);

        // results.friendsOfUser.forEach((friend) => {
        //   let reducedFriendList = friend.friends.filter(val => val != userToDelete._id);
        //   User.update({ _id: friend._id }, { friends: reducedFriendList });
        // });

        // results.friendshipsRequestedByUser.forEach((requestee) => {
        //   let reducedFriendRequestList = requestee.friendRequests.filter(val => val != userToDelete._id);
        //   User.update({ _id: requestee._id }, { friendRequests: reducedFriendRequestList });
        // });

        async.parallel({
          postsDelete: function (callback) {
            Post.deleteMany({ _id: { '$in': postIds } })
            .exec(callback);
          },
          userCommentsDelete: function (callback) {
            Comment.deleteMany({ _id: { '$in': userCommentIds } })
            .exec(callback);
          },
          commentsDelete: function (callback) {
            Comment.deleteMany({ _id: { '$in': commentIds } })
            .exec(callback);
          },
          friendsToDelete: function (callback) {
            results.friendsOfUser.forEach((friend) => {
              let reducedFriendList = friend.friends.filter(val => val != userToDelete._id);
              User.update({ _id: friend._id }, { friends: reducedFriendList })
              .exec(callback);
            });
          },
          friendRequestsToDelete: function (callback) {
            results.friendshipsRequestedByUser.forEach((requestee) => {
              let reducedFriendRequestList = requestee.friendRequests.filter(val => val != userToDelete._id);
              User.update({ _id: requestee._id }, { friendRequests: reducedFriendRequestList })
              .exec(callback);
            });
          },
        }, function (err, deletedStuff) {
          User.findByIdAndRemove(req.params.id, function deleteUser(err) {
            if (err) {
              return next(err);
            }

            res.redirect('/');
          });
        });
      });
    });
  });
};

exports.user_update_get = function (req, res, next) {

};

exports.user_update_put = [

  (req, res, next) => {

  },
];

exports.user_profile_get = function (req, res, next) {
  async.parallel({
    user: function (callback) {
      User.findById(req.params.id)
      .exec(callback);
    },
    postsOfUser: function (callback) {
      Post.find({ 'author': req.params.id })
      .sort('-createdAt')
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    let idsOfPosts = results.postsOfUser.filter(post => post._id);
    Comment.find({ 'post': { $in: idsOfPosts } })
    .sort('createdAt')
    .populate('commenter')
    .exec(function (err, commentsToPostsOfUser) {
      res.render('profile', { title: results.user.firstName + ' ' + results.user.lastName, user: results.user, currentUser: req.user, postsOfUser: results.postsOfUser, commentsToPostsOfUser: commentsToPostsOfUser });
    });
  });
};

exports.user_profilePOST = function (req, res, next) {
  async.parallel({
    user: function (callback) {
      User.findById(req.params.id)
      .exec(callback);
    },
    postsOfUser: function (callback) {
      Post.find({ 'author': req.params.id })
      .sort('-createdAt')
      .exec(callback);
    },
  }, function (err, results) {
    if (err) {
      return next(err);
    }
    let idsOfPosts = results.postsOfUser.filter(post => post._id);
    Comment.find({ 'post': { $in: idsOfPosts } })
    .sort('createdAt')
    .populate('commenter')
    .exec(function (err, commentsToPostsOfUser) {

      if (req.body.postToEditId) {
        Post.findById(req.body.postToEditId)
        .exec(function (err, postToEdit) {
          if (err) {
            return next(err);
          }
          res.render('profile', { title: results.user.firstName + ' ' + results.user.lastName, user: results.user, currentUser: req.user, postsOfUser: results.postsOfUser, commentsToPostsOfUser: commentsToPostsOfUser, postToEdit });
        });
      } else if (req.body.commentToEditId) {
        Comment.findById(req.body.commentToEditId)
        .exec(function (err, commentToEdit) {
          if (err) {
            return next(err);
          }
          res.render('profile', { title: results.user.firstName + ' ' + results.user.lastName, user: results.user, currentUser: req.user, postsOfUser: results.postsOfUser, commentsToPostsOfUser: commentsToPostsOfUser, commentToEdit });
        })
      } else {
        res.render('profile', { title: results.user.firstName + ' ' + results.user.lastName, user: results.user, currentUser: req.user, postsOfUser: results.postsOfUser, commentsToPostsOfUser: commentsToPostsOfUser });
      }
    });
  });
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

      User.findByIdAndUpdate(potentialFriend._id, user, {}, function (err, updatedUser) {
        if (err) {
          return next(err);
        }
        res.redirect(req.get('referer'));
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

      let requestsReduced = req.user.friendRequests.filter(val => val != newFriend._id);

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

      User.findByIdAndUpdate(newFriend._id, friend, {}, function (err, updatedFriend) {
        User.findByIdAndUpdate(req.user._id, user, {}, function (err, updatedUser) {
          res.redirect(req.get('referer'));
        });
      });
    })
  },
];

exports.request_decline_post = [
  (req, res, next) => {
    async.parallel({
      friendNotToBe: function (callback) {
        User.findById(JSON.parse(req.body.potentialFriend)._id)
        .exec(callback);
      },
      referrer: function (callback) {
      let referrerURL = req.get('Referrer');
      let referrer = referrerURL.substring(referrerURL.lastIndexOf('/') + 1);
      callback(null, referrer);
      },
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      let requestsReduced = req.user.friendRequests.filter(val => val != results.friendNotToBe._id);

      User.update({ _id: req.user._id }, { friendRequests: requestsReduced }, function (err, updatedUser) {
        if (err) {
          return next(err);
        }

        if (results.referrer == 'users') {
          res.redirect('/users');
        } else {
          res.redirect('/users/' + req.user._id + '/friend-requests');
        }
      });
    });
  },
];

exports.request_cancel_post = [
  (req, res, next) => {
      User.findById(JSON.parse(req.body.potentialFriend)._id)
      .exec(function (err, friendNotToBe) {

        if (err) {
          return next(err);
        }

        let requestsReduced = friendNotToBe.friendRequests.filter(val => val != req.user._id);

        User.update({ _id: friendNotToBe._id }, { friendRequests: requestsReduced }, function (err, updatedUser) {
          if (err) {
            return next(err);
          }

          res.redirect(req.get('referer'));
      });
    });
  },
];

exports.remove_friend_post = [
  (req, res, next) => {
    console.log('soonExFriendsId: ', req.body.soonExFriend._id);
    User.findOne({ _id: req.body.soonExFriend })
    .exec(function (err, soonExFriend) {
      if (err) {
        return next(err);
      }
      console.log('soonExFriend after finding: ', soonExFriend);

      let exFriendFriendsReduced = soonExFriend.friends.filter(val => val != req.user._id);
      User.update({ _id: soonExFriend._id }, { friends: exFriendFriendsReduced }, function (err, updatedUser) {
        if (err) {
          return next(err);
        }

        let userFriendsReduced = req.user.friends.filter(val => val != soonExFriend._id);
        User.update({ _id: req.user._id }, { friends: userFriendsReduced }, function (err, updatedCurrentUser) {
          if (err) {
            return next(err);
          }

          res.redirect(req.get('referer'));
        });
      });
    });
  },
];
