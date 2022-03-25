//check existing emails in the database to return value of users
const getUserByEmail = function (email, users) {
	for (const user in users) {
		if (users[user].email === email) {
			return users[user];
		}
	}
	return undefined;
};
//return shortURL passed to specific userID
const urlsForUser = function (id, urlDatabase) {
	let userURLs = {};
	for (const shortURL in urlDatabase) {
		if (id === urlDatabase[shortURL].userID) {
			userURLs[shortURL] = urlDatabase[shortURL];
		}
	}
	return userURLs;
};

function generateRandomString() {
	// generates random string
	return Math.random().toString(36).slice(-6);
}

module.exports = {
	getUserByEmail,
	urlsForUser,
	generateRandomString,
};
