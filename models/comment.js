let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const moment = require('moment');

let CommentSchema = new Schema({
  commenter: { type: Schema.Types.ObjectId, ref: 'User' },
  commentContent: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, required: true },
});

CommentSchema
.virtual('createdAgo')
.get(function() {
  return moment(this.createdAt).fromNow();
});

module.exports = mongoose.model('Comment', CommentSchema);
