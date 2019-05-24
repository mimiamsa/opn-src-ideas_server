const mongoose 	= require('mongoose');
const Schema   	= mongoose.Schema;
const User 			= require("./user")

const IdeaSchema = new Schema({
  creator: {type: Schema.Types.ObjectId, ref: 'User'},
	title: String,
  description: String,
	category: String,
  tags: [String],
	isPublic: Boolean,
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
	upvotes: {type: Number, default: 0},
	downvotes: {type: Number, default: 0},
	upvotedUsers: [{type: Schema.Types.ObjectId, ref: 'User'}],
	downvotedUsers: [{type: Schema.Types.ObjectId, ref: 'User'}],
	isArchived: Boolean}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Idea = mongoose.model('Idea', IdeaSchema);

module.exports = Idea;
