const express    = require('express');
const authRoutes = express.Router();

const passport   = require('passport');
const bcrypt     = require('bcryptjs');
const User       = require('../models/user');


authRoutes.post('/signup', (req, res, next) => {
	const username = req.body.username;
	const name = req.body.name;
	const password = req.body.password;
  
	if (!username || !name || !password) {
		res.status(400).json({ message: 'Please provide a username, email, and password' });
		return;
	}

  User.findOne({ username }, (err, foundUser) => {
		if(err){
			res.status(500).json({message: "Error checking username"});
			return;
		}

		if (foundUser) {
			res.status(400).json({ message: 'Sorry, username already exists' });
			return;
		}
  
		const salt     = bcrypt.genSaltSync(10);
		const hashPass = bcrypt.hashSync(password, salt);

		const newUser = new User({
			username: username,
			name: name,
			password: hashPass
		});
  
		newUser.save(err => {
			if (err) {
				res.status(400).json({ message: 'Error saving user to database' });
				return;
			}
            
			// LOGIN with new user info
			req.login(newUser, (err) => {
				if (err) {
					res.status(500).json({ message: 'Error logging in after signup.' });
					return;
				}
				// SEND new user info
				res.status(200).json(newUser);
			});
		});
	});
});

authRoutes.post('/login', (req, res, next) => {
	passport.authenticate('local', (err, thisUser, errDetails) => {
		if (err) {
			res.status(500).json({ message: 'Error authenticating thisUser' });
			return;
		}

		if (!thisUser) {
			res.status(401).json(errDetails);
			return;
		}

		req.login(thisUser, (err) => {
			if (err) {
				res.status(500).json({ message: 'Could not save session' });
				return;
			}

			//LOGGED IN, send to front
			res.status(200).json(thisUser);
		});
	})(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
    req.logout();
    res.status(200).json({ message: 'Log out success!' });
});

authRoutes.get('/loggedin', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
        return;
    }
    res.status(403).json({ message: 'Unauthorized' });
});


module.exports = authRoutes;