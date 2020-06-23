let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
  commenter: { type: Schema.Types.ObjectId, ref: 'User' },
  commentContent: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, required: true },
});

module.exports = mongoose.model('Comment', CommentSchema);
