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

exports.comment_update_put = [

];

exports.comment_delete = function (req, res, next) {

};
