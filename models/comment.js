const mongoose 	= require('mongoose');
const Schema   	= mongoose.Schema;

const CommentSchema = new Schema({
  creator: {type: Schema.Types.ObjectId, ref: 'User'}, 
	idea: {type: Schema.Types.ObjectId, ref: 'Idea'},
	content: String}, {
	timestamps: { createdAt: "created_at"}
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
