let User = require('../models/user');
let Post = require('../models/post');
let Comment = require('../models/comment');

let async = require('async');
const { body, validationResult } = require('express-validator');

exports.post_create_post = [
  body('postContent')
  .trim()
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    let post = new Post({
      author: req.user,
      createdAt: new Date(),
      postContent: req.body.postContent,
      likes: [],
      postPicture: (req.file) ? req.file.path: '',
    });

    if (req.file) {
      User.update({ _id: req.user._id }, { gallery: req.user.gallery.concat([req.file.path]) }, function (err, updatedUser) {
        if (err) {
          return next(err);
        }

        if (!errors.isEmpty()) {
          let errors = req.flash('error');
          res.status(400).redirect('/');
        } else {
          post.save(err => {
            if (err) {
              return next(err);
            }

            res.redirect(req.get('referer'));
          });
        }
      });
    } else {
      if (!errors.isEmpty()) {
        let errors = req.flash('error');
        res.redirect('/');
      } else {
        post.save(err => {
          if (err) {
            return next(err);
          }

          res.redirect(req.get('referer'));
        });
      }
    }
  },
];

exports.add_like_post = [
  (req, res, next) => {
    Post.findById(req.body.postId)
    .exec(function (err, postToUpdate) {
      let post = new Post({
        author: postToUpdate.author,
        createdAt: postToUpdate.createdAt,
        postContent: postToUpdate.postContent,
        likes: postToUpdate.likes.concat([req.body.postFan]),
        postPicture: postToUpdate.postPicture,
        _id: postToUpdate._id,
      });

      console.log('req.body.postFanId: ', req.body.postFan);

      Post.findByIdAndUpdate(postToUpdate._id, post, {}, function (err, updatedPost) {
        if (err) {
          return next(err);
        }

        res.redirect(req.get('referer'));
      });
    });
  },
];

exports.remove_like_post = [
  (req, res, next) => {
    Post.findById(req.body.postId)
    .exec(function (err, postToUpdate) {

      let likesReduced = postToUpdate.likes.filter((val => val != req.body.postFan));

      let post = new Post({
        author: postToUpdate.author,
        createdAt: postToUpdate.createdAt,
        postContent: postToUpdate.postContent,
        likes: likesReduced,
        postPicture: postToUpdate.postPicture,
        _id: postToUpdate._id,
      });

      Post.findByIdAndUpdate(postToUpdate._id, post, {}, function (err, updatedPost) {
        if (err) {
          return next(err);
        }

        res.redirect(req.get('referer'));
      });
    });
  },
];

exports.post_update_post = [
  body('postContent')
  .trim()
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    Post.findById(req.params.id)
    .exec(function (err, postToUpdate) {

      let post = new Post({
        author: postToUpdate.author,
        createdAt: postToUpdate.createdAt,
        postContent: req.body.postContent,
        likes: postToUpdate.likes,
        postPicture: (req.file) ? req.file.path: postToUpdate.postPicture,
        _id: postToUpdate._id,
      });

      if (req.file) {
        User.update({ _id: req.user._id }, { gallery: req.user.gallery.concat([req.file.path]) }, function (err, updatedUser) {
          if (err) {
            return next(err);
          }

          if (!errors.isEmpty()) {
            let errors = req.flash('error');
            res.redirect('/');
          } else {
            Post.findByIdAndUpdate(req.params.id, post, {}, function (err, updatedPost) {
              if (err) {
                return next(err);
              }

              res.redirect(req.get('referer'));
            });
          }
        });
      } else {

        if (!errors.isEmpty()) {
          let errors = req.flash('error');
          res.redirect('/');
        } else {
          Post.findByIdAndUpdate(req.params.id, post, {}, function (err, updatedPost) {
            if (err) {
              return next(err);
            }

            res.redirect(req.get('referer'));
          });
        }
      }

    });
  },
];

exports.post_delete_post = function (req, res, next) {
  Comment.find({ 'post': req.body.postToDeleteId })
  .exec(function (err, commentsOfPost) {

    Post.findByIdAndRemove(req.body.postToDeleteId, function deletePost(err) {
      if (err) {
        return next(err);
      }

      let commentIds = commentsOfPost.map(comment => comment.id);

      Comment.deleteMany({ '_id': { $in: commentIds } })
      .exec(function (err, deletedComments) {
        if (err) {
          return next(err);
        }

        res.redirect(req.get('referer'));
      });
    });
  });
};
