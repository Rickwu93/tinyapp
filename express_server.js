const express = require("express"); 
const bodyParser = require("body-parser"); //imported body parser
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; 

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs"); 

function generateRandomString() { // generates random string
  return Math.random().toString(36).slice(-6);
};

//check existing emails are duplicates
const findDuplicateEmails = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
};

const users = { //user object
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
} 

app.get("/", (req, res) => { 
  res.send("Hello!"); //sends hello to the browser
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //gets the json response of the urldatabase object
});

app.get("/hello", (req, res) => { 
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => { 
  const user = users[req.cookies["user_id"]]
  const templateVars = { 
    user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});

app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  //user cannot access page to create url, cannot access and redirects
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user
  };
   if (!templateVars.user) {
     res.redirect("/login")
   } else {
  res.render("urls_new", templateVars);
   }
});
//since const URL changed we need to change the object structure for all
app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };   
  res.render("urls_show", templateVars); 
}); 
        //when users create new undefined URL
app.get("/u/:shortURL", (req, res) => { 
 const longURL = urlDatabase[req.params.shortURL].longURL;
 if (longURL === undefined) {
  res.send(302);
} else {
  res.redirect(longURL);
}
});

//GET - render into login page
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user
  };
  res.render("login_page", templateVars)
});

app.post('/urls/:shortURL', (req, res) => {
  //console.log(req.params)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL
  res.redirect("/urls");
});
//POST - creates new url to database and redirects to short url page
app.post("/urls", (req, res) => { 
  //const longURL = req.body.longURL
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {       //value for longURL changed
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});
//POST - deletes out url stored
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const user = users[req.cookies["user_id"]]
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user}
  res.render("urls_show", templateVars); //render builds a page 
});

//render the registration page
app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]] 
  const templateVars = {
    user
  };  
  // console.log(templateVars);
  res.render('registration_page', templateVars);
});
///register endpoint for newly created username/password + added conditions
app.post('/register', (req, res) => {
  const candidateEmail = req.body.email;
  const candidatePassword = req.body.password;

  if (!candidateEmail || !candidatePassword) {
    res.send(400, "Please create a valid email and password");
  };

  if (findDuplicateEmails(candidateEmail, users)) {
    res.send(400, "This email is already existing in our database")
  };

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: candidateEmail,
    password: candidatePassword
  };
    res.cookie('user_id', newUserID);
    res.redirect("/urls")
});


//POST - updates long url
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL; //this changes the url fields to new updated one
  res.redirect("/urls");
});

//POST - login and then redirect user back new endpoint email/password fields
app.post('/login', (req, res) => {
  const user = findDuplicateEmails(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('403 Status Code. You entered the wrong password.')
    }
  } else {
    res.statusCode = 403;
    res.send('403 Status Code. This email address is not registered.')
  }
});
//POST - logout and clears cookies then redirect user back to /url
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});



app.listen(PORT, () => { //telling server to listen to this port 
  console.log(`Example app listening on port ${PORT}!`);
});

//req.params = an object that holds all the parameters from the URL 
// <%= id %> is a dynamic tag that brings in the variable 
//res.render('____') brings and connects the ejs file with the server file 