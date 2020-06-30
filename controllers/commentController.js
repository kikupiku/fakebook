let User = require('../models/user');
let Post = require('../models/post');
let Comment = require('../models/comment');

let async = require('async');
const { body, validationResult } = require('express-validator');

exports.comment_create_post = [
  body('commentContent')
  .trim()
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    let comment = new Comment({
      commenter: req.user,
      commentContent: req.body.commentContent,
      post: req.body.commentedPostId,
      createdAt: new Date(),
    });

    if (!errors.isEmpty()) {
      res.status(400).redirect('/', { errors: errors.array() });
    } else {
      comment.save(err => {
        if (err) {
          return next(err);
        }

        res.redirect(req.get('referer'));
      });
    }
  },
];

exports.comment_update_post = [
  body('commentContent')
  .trim()
  .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    Comment.findById(req.params.id)
    .exec(function (err, commentToUpdate) {
      if (err) {
        return next(err);
      }

      let comment = new Comment({
        commenter: commentToUpdate.commenter,
        commentContent: req.body.commentContent,
        post: commentToUpdate.post,
        createdAt: commentToUpdate.createdAt,
        _id: commentToUpdate._id,
      });

      if (!errors.isEmpty()) {
        res.status(400).redirect('/', { errors: errors.array() });
      } else {
        Comment.findByIdAndUpdate(req.params.id, comment, {}, function (err, updatedComment) {
          if (err) {
            return next(err);
          }

          res.redirect(req.get('referer'));
        });
      }
    });
  },
];

exports.comment_delete_post = function (req, res, next) {
  Comment.findByIdAndRemove(req.body.commentToDeleteId, function deleteComment(err) {
      if (err) {
        return next(err);
      }

      res.redirect(req.get('referer'));
    });
};
