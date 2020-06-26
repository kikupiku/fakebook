let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const moment = require('moment');

let PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, required: true },
  postContent: { type: String, required: true },
  likes: [{ type: String }],
  fans: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  postPicture: { type: String, required: false },
});

PostSchema
.virtual('createdAgo')
.get(function() {
  return moment(this.createdAt).fromNow();
});

module.exports = mongoose.model('Post', PostSchema);
