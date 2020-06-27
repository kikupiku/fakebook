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
router.post('/log-in', userController.user_login);
router.get('/log-out', userController.user_logout_get);
router.delete('/users/:id', userController.user_delete);
router.get('/users/:id/update', userController.user_update_get);
router.put('/users/:id', userController.user_update_put);
router.get('/users/:id', userController.user_profile_get); //user info and all of this user's posts
router.get('/users/:id/friend-requests', userController.friend_requests_get);
router.get('/users/:id/friend-list', userController.friend_list_get);
router.post('/request-friendship', userController.request_friendship_post);
router.post('/request-accept', userController.request_accept_post);
router.post('/request-decline', userController.request_decline_post);

// POST ROUTES

router.post('/posts', parser.single('image'), postController.post_create_post);
router.post('/posts/:id', parser.single('image'), postController.add_like_post);
router.post('/remove-like', parser.single('imsge'), postController.remove_like_post);
router.delete('/posts/:id', postController.post_delete);

// COMMENT ROUTES

router.post('/comments', commentController.comment_create_post);
router.put('/comments/:id', commentController.comment_update_put);
router.delete('/comments/:id', commentController.comment_delete);

//FACEBOOK ROUTES

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/',
  failureRedirect: '/',
}));

module.exports = router;

// TODO:
// build profile with posts and comments,
// refactor redirect to be conditional based on whether the referrer is profile or timeline (so that it goes back to where the user was)
// edit comments,
// delete comments,
// edit posts,
// delete posts,
// edit user info,
// delete user (big one!)
// decline friendship request endpoint,
// allow processing friend requests from find friends and friend
// request pages alike, and refactor redirect in a similar way as with profile and timeline redirects
// visualssssss
