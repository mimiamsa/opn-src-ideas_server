const mongoose 	= require('mongoose');
const Schema   	= mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  name: String,
	password: String,
	avatar: String,
	bio: String,
	social: {
		contact_name: String,
		website: String,
		twitter: String,
		linkedIn: String,
		productHunt: String,
	},
  myIdeas: [{type: Schema.Types.ObjectId, ref: 'Idea'}],
	// drafts: [{type: Schema.Types.ObjectId, ref: 'Idea'}],
	upvotedIdeas: [{type: Schema.Types.ObjectId, ref: 'Idea'}],
	// downvotedIdeas: [{type: Schema.Types.ObjectId, ref: 'Idea'}],
	ranking: Number,
	avatar: {
		type: String,
		default: "https://media.giphy.com/media/QvvtwToKIUUpWXDPK6/giphy.gif"
	},
	location: String
  },{
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
	});

const User = mongoose.model('User', UserSchema);

module.exports = User;
