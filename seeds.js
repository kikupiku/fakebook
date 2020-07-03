let app = require('./app');

let User = require('./models/user');
let Post = require('./models/post');
let Comment = require('./models/comment');

const faker = require('faker');
const bcrypt = require('bcryptjs');

let users = [];
let posts = [];
let comments = [];
let friends = [];

User.remove({})
.then((_) => {
  Post.remove({})
  .then((_) => {
    Comment.remove({})
    .then((_) => {

      for (let i = 0; i < 100; i++) {
        let password = process.env.SEEDER_PASSWORD;
        console.log('making user no. ', i);

        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
          }

          let avatar = faker.image.avatar();

          const user = new User({
            firstName: faker.name.firstName(),
            lastName: faker.name.firstName(),
            email: faker.internet.email(),
            password: hashedPassword,
            friends: [],
            friendRequests: [],
            picture: avatar,
            gallery: [avatar],
          });

          user.save()
          .then(userRef => {
            console.log('user created: ', i);
            users.push(userRef._id);
            if (users.length >= 100) {
              makeFriendships();
            }
          })
        });
      }

      function makeFriendships() {
        let futureFriends = users.slice(0, 30);

        futureFriends.forEach((id, index) => {
          console.log('making friends for user ', index);
          let futureFriendsWithoutMe = futureFriends.filter(val => val != id);
          User.findByIdAndUpdate(id, { friends: futureFriendsWithoutMe })
          .exec(function (err, updatedFriend) {
            console.log('added: ', index);
            friends.push(id);
            if (friends.length >= 30) {
              makePosts();
            }
          });
        })
      }
    });
  });
}).catch(err => console.log('we\'ve made it here!'));

function makePosts() {
  for (let i = 0; i < 200; i++) {

    let likes = [];
    let usedIndices = [];
    let pictureIsPresent = faker.random.boolean();
    let longSentence = faker.random.boolean();
    let randomUserIndex = faker.random.number({ 'min': 0, 'max': 99 });   // can be repeated
    let numberOfLikes = faker.random.number({ 'min': 0, 'max': 20 });

    for (let n = 0; n < numberOfLikes; n++) {
      let randomLikerIndex = faker.random.number({ 'min': 0, 'max': 100 });  //cannot be repeated
      if (!usedIndices.includes(randomUserIndex)) {
        usedIndices.push(randomLikerIndex);
        likes.push(users[randomLikerIndex]);
      }
    }

    console.log('post no. ', i, ' gets ', likes.length, ' likes');

    User.findById(users[randomUserIndex])
    .exec(function (err, postAuthor) {

      let pictureForPostAndGallery = faker.image.image();

      let post = new Post({
        author: postAuthor,
        createdAt: faker.date.recent(),
        postContent: (longSentence) ? faker.lorem.paragraph() : faker.lorem.sentence(),
        likes: likes,
        postPicture: (pictureIsPresent) ? pictureForPostAndGallery : '',
      });

      if (pictureIsPresent) {
        User.update({ _id: postAuthor._id }, { gallery: postAuthor.gallery.concat([pictureForPostAndGallery]) }, function (err, updatedUser) {
          post.save()
          .then(postRef => {
            console.log('post created: ', i);
            posts.push(postRef._id);
            if (posts.length >= 200) {
              makeComments();
            }
          })
        });
      } else {
        post.save()
        .then(postRef => {
          console.log('post created: ', i);
          posts.push(postRef._id);
          if (posts.length >= 200) {
            makeComments();
          }
        })
      }
    });
  }
}

function makeComments() {

  for (let i = 0; i < 300; i++) {
    let randomUserIndex = faker.random.number({ 'min': 0, 'max': 99 });   // can be repeated
    let randomPostIndex = faker.random.number({ 'min': 0, 'max': 199 });   // can be repeated
    let longComment = faker.random.boolean();

    User.findById(users[randomUserIndex])
    .exec(function (err, commentAuthor) {
      Post.findById(posts[randomPostIndex])
      .exec(function (err, postOfComment) {

        let comment = new Comment({
          commenter: commentAuthor,
          commentContent: (longComment) ? faker.lorem.sentence() : faker.lorem.words(),
          post: postOfComment,
          createdAt: faker.date.recent(),
        });

        comment.save()
        .then(commentRef => {
          console.log('comment created: ', i);
          comments.push(commentRef._id);
          if (comments.length >= 300) {
            console.log('seeding successful');
            return Promise.reject('end');
          }
        })
      });
    });
  }
}
