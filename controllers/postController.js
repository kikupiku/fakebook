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
    console.log('paaaaaaaaaaaath: ', req.file.path);

    let post = new Post({
      author: req.user,
      createdAt: new Date(),
      postContent: req.body.postContent,
      likes: 0,
      fans: [],
      postPicture: req.file.path,
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

];

exports.post_delete = function (req, res, next) {

};
