let express = require('express');
let router = express.Router();
let passport = require('../passport');

let userController = require('../controllers/userController');
let postController = require('../controllers/postController');
let commentController = require('../controllers/commentController');

const parser = require('../cloudinary-config');

/* GET home page. */
router.get('/', userController.timeline); // signup/login page when not logged-in
router.post('/', userController.timelinePOST);

// USER ROUTES

router.post('/users', parser.single('image'), userController.user_create_post);
// authentication routes
router.post('/log-in', userController.user_login);
router.get('/log-out', userController.user_logout_get);
// user delete routes
router.get('/users/:id/delete', userController.user_delete_get);
router.post('/users/:id/delete', userController.user_delete_post);
// user update routes
router.get('/users/:id/manage', userController.user_manage_get);
router.post('/users/:id/update-personal-info', parser.single('image'), userController.user_personal_info_update_post);
router.post('/users/:id/update-password', userController.user_password_update_post);
// profile routes
router.get('/users/:id', userController.user_profile_get);
router.post('/users/:id', userController.user_profilePOST);
// friend themed routes
router.get('/users', userController.find_friends_get); // instead of all users list
router.get('/users/:id/friend-requests', userController.friend_requests_get);
router.get('/users/:id/friend-list', userController.friend_list_get);
router.post('/request-friendship', userController.request_friendship_post);
router.post('/request-accept', userController.request_accept_post);
router.post('/request-decline', userController.request_decline_post);
router.post('/request-cancel', userController.request_cancel_post);
router.post('/remove-friend', userController.remove_friend_post);
// user photo gallery
router.get('/users/:id/gallery', userController.user_gallery_get);

// POST ROUTES

router.post('/posts', parser.single('image'), postController.post_create_post);
router.post('/posts/:id', postController.add_like_post);
router.post('/remove-like', postController.remove_like_post);
router.post('/posts/:id/edit', parser.single('image'), postController.post_update_post);
router.post('/posts/:id/delete', postController.post_delete_post);

// COMMENT ROUTES

router.post('/comments', commentController.comment_create_post);
router.post('/comments/:id/edit', commentController.comment_update_post);
router.post('/comments/:id/delete', commentController.comment_delete_post);

//FACEBOOK ROUTES

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
}));

module.exports = router;

// TODO:
// visualssssss
