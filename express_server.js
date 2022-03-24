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
const duplicateUser = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  } return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    user
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const user = users[req.cookies["user_id"]]
  const templateVars = {
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL],
    user
  };   
  res.render("urls_show", templateVars); 
}); 
        
app.get("/u/:shortURL", (req, res) => { 
 const longURL = urlDatabase[req.params.shortURL]
 const user = users[req.cookies["user_id"]]
 const templateVars = {
   user
 };
  res.redirect(longURL, templateVars)
});

app.post('/urls/:shortURL', (req, res) => {
  //console.log(req.params)
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL
  res.redirect("/urls");
});
//POST - creates new url to database and redirects to short url page
app.post("/urls", (req, res) => { 
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
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

  if (duplicateUser(candidateEmail)) {
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

//POST - login and then redirect user back to /url
app.post("/login", (req, res) => {
  const id = req.body["user_id"];
  res.cookie("user_id", id);
  res.redirect("/urls");
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