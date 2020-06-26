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

    if (!errors.isEmpty()) {
      res.status(400).redirect('/', { errors: errors.array() });
    } else {
      post.save(err => {
        if (err) {
          return next(err);
        }

        res.redirect('/');
      });
    }
  },
];

exports.post_update_put = [   //e.g., when likes are clicked
  (req, res, next) => {
    Post.findById(req.body.postId)
    .exec(function (err, postToUpdate) {
      let post = new Post({
        author: postToUpdate.author,
        createdAt: postToUpdate.createdAt,
        postContent: postToUpdate.createdAt,
        likes: postToUpdate.likes.push(req.body.postFan),
        postPicture: postToUpdate.postPicture,
        _id: postToUpdate._id,
      });

      Post.findByIdAndUpdate(postToUpdate._id, post, {}, function (err, updatedPost) {
        if (err) {
          return next(err);
        }

        res.render('timeline', {title: 'added like' });
      });
    });
  },
];

exports.post_delete = function (req, res, next) {

};
