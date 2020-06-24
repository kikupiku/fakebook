let express = require('express');
let router = express.Router();
let passport = require('../passport');

let userController = require('../controllers/userController');
let postController = require('../controllers/postController');
let commentController = require('../controllers/commentController');

const parser = require('../cloudinary-config');

/* GET home page. */
router.get('/', userController.timeline); // signup/login page when not logged-in

// USER ROUTES

router.get('/users', userController.find_friends_get); //all users list
router.post('/users', parser.single('image'), userController.user_create_post);
router.delete('/users/:id', userController.user_delete);
router.get('/users/:id/update', userController.user_update_get);
router.put('/users/:id', userController.user_update_put);
router.get('/users/:id', userController.user_profile_get); //user info and all of this user's posts
router.get('/users/:id/friend-requests', userController.friend_requests_get);
router.get('/users/:id/friend-list', userController.friend_list_get);

// POST ROUTES

router.post('/posts', postController.post_create_post);
router.put('/posts/:id', postController.post_update_put);
router.delete('/posts/:id', postController.post_delete);

// COMMENT ROUTES

router.post('/comments', commentController.comment_create_post);
router.put('/comments/:id', commentController.comment_update_put);
router.delete('/comments/:id', commentController.comment_delete);

//FACEBOOK ROUTES

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

module.exports = router;
