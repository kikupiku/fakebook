let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, required: true },
  postContent: { type: String, required: true },
  likes: { type: Number, default: 0 },
  fans: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  postPicture: { type: String, required: false },
});

module.exports = mongoose.model('Post', PostSchema);
