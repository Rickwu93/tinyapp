const express = require('express');
const bodyParser = require('body-parser'); 
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

const {
	getUserByEmail,
	urlsForUser,
	generateRandomString,
} = require('./helpers');

app.use(
	cookieSession({
		name: 'session',
		keys: [
			'C&F)J@Nc',
			'9y$B&E)H',
			's6v9y/B?',
			'Xp2s5v8y',
			'fUjXn2r5',
			'McQfTjWn',
			'(H+MbQeT',
			'A?D(G+Kb',
			'8x!A%D*G',
			'r4u7w!z%',
		],
	})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const urlDatabase = {
	b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
	'9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
};

const users = {
	//user object
	userRandomID: {
		id: 'userRandomID',
		email: 'user@example.com',
		password: bcrypt.hashSync('purple-monkey-dinosaur'),
	},
	user2RandomID: {
		id: 'user2RandomID',
		email: 'user2@example.com',
		password: bcrypt.hashSync('dishwasher-funk'),
	},
};

app.get('/', (req, res) => {
	res.redirect('/register'); //redirects user to register page
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase); //gets the json response of the urldatabase object
});

app.get('/hello', (req, res) => {
	res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
	const templateVars = {
		urls: urlsForUser(req.session['user_id'], urlDatabase),
    user: users[req.session['user_id']],
	};
	//console.log('templateVars:', templateVars)
	res.render('urls_index', templateVars); //render using urls_index for the value of templateVars
});

app.get('/urls/new', (req, res) => {
	//get the response for urls/new and I want to render what I have on urls_new
	//user cannot access page to create url, cannot access and redirects
	const user = users[req.session['user_id']];
	if (!users) {
		return res.redirect('/login');
	}
	const templateVars = {
		user,
	};
	if (!templateVars.user) {
		res.redirect('/login');
	} else {
		res.render('urls_new', templateVars);
	}
});
//since const URL changed we need to change the object structure for all
app.get('/urls/:shortURL', (req, res) => {
	//when given a shortURL
	const templateVars = {
		shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
		longURL: urlDatabase[req.params.shortURL].longURL,
		urlUserID: urlDatabase[req.params.shortURL].userID,
		user: users[req.session['user_id']],
	};
	res.render('urls_show', templateVars);
});
//when users create new undefined URL
app.get('/u/:shortURL', (req, res) => {
	const longURL = urlDatabase[req.params.shortURL].longURL;
	if (longURL === undefined) {
		res.send(302);
	} else {
		res.redirect(longURL);
	}
});

//GET - render into login page
app.get('/login', (req, res) => {
	const user = users[req.session['user_id']];
	const templateVars = {
		user,
	};
	res.render('login_page', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
	//console.log(req.params)
	const shortURL = req.params.shortURL;
	urlDatabase[shortURL] = req.body.newURL;
	res.redirect('/urls');
});
//POST - creates new url to database and redirects to short url page
app.post('/urls', (req, res) => {
	//const longURL = req.body.longURL
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = {
		//value for longURL changed
		longURL: req.body.longURL,
		userID: req.session['user_id'],
	};
	//console.log(urlDatabase);
	res.redirect(`/urls/${shortURL}`);
});
//POST - deletes out url stored
app.post('/urls/:shortURL/delete', (req, res) => {
	const user = users[req.session['user_id']];

	if (!user) {
		return res.send('Please log in');
	}

	delete urlDatabase[req.params.shortURL];
	res.redirect('/urls');
});
//allow for editing on the shortURLs page
app.get('/urls/:shortURL/edit', (req, res) => {
	const user = users[req.session['user_id']];
	if (!user) {
		return res.send('Please log in');
	}

	//console.log(urlDatabase[req.params.shortURL])
	const templateVars = {
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL].longURL,
		user: users[req.session['user_id']],
	};
	res.render('urls_show', templateVars); //render builds a page
});

//render the registration page
app.get('/register', (req, res) => {
	const user = users[req.session['user_id']];
	const templateVars = {
		user,
	};
	// console.log(templateVars);
	res.render('registration_page', templateVars);
});
///register endpoint for newly created username/password + added conditions
app.post('/register', (req, res) => {
	const candidateEmail = req.body.email;
	const candidatePassword = bcrypt.hashSync(req.body.password);

  if (!candidateEmail || !candidatePassword === ' ') {
		res.send(400, 'Please input the required fields');
	}

	if (!candidateEmail || !candidatePassword) {
		res.send(400, 'Please create a valid email and password');
	}

	if (getUserByEmail(candidateEmail, users)) {
		res.send(400, 'This email is already existing in our database');
	}

	const newUserID = generateRandomString();
	users[newUserID] = {
		id: newUserID,
		email: candidateEmail,
		password: candidatePassword,
	};
	req.session.user = req.body.user_id;
	res.redirect('/urls');
});

//POST - updates long url to the user
app.post('/urls/:shortURL/edit', (req, res) => {
	const user = users[req.session['user_id']];
	if (!user) {
		return res.send('Please log in');
	}
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL].longURL = longURL; //this changes the url fields to new updated one
	res.redirect('/urls');
});

//POST - login and then redirect user back new endpoint email/password fields
app.post('/login', (req, res) => {
	const user = getUserByEmail(req.body.email, users);
	if (user) {
		if (bcrypt.compareSync(req.body.password, user.password)) {
			req.session['user_id'] = user.id;
			return res.redirect('/urls');
		} else {
			res.statusCode = 403;
			return res.send('403 Status Code. Invalid credentials.');
		}
	} else {
		res.statusCode = 403;
		return res.send('403 Status Code. This email address is not registered.');
	}
});
//POST - logout and clears session then redirect user back to /url
app.post('/logout', (req, res) => {
	// res.clearCookie("user_id")
	req.session = null;
	res.redirect('/urls');
});

app.listen(PORT, () => {
	//telling server to listen to this port
	console.log(`Example app listening on port ${PORT}!`);
});
