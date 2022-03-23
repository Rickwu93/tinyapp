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
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

 
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
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars) //render using urls_index for the value of templateVars
});

app.get("/urls/new", (req, res) => { //get the response for urls/new and I want to render what I have on urls_new
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { //when given a shortURL 
  const templateVars = {
    shortURL: req.params.shortURL, // when you do the get req. the req is the object of the url. params is one of the keys and :shortURL is the value of that key
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };   
  res.render("urls_show", templateVars); 
}); 
        
app.get("/u/:shortURL", (req, res) => { 
 const longURL = urlDatabase[req.params.shortURL]
 const templateVars = {
   username: req.cookies["username"]
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
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render("urls_show", templateVars); //render builds a page 
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
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});
//POST - logout and clears cookies then redirect user back to /url
app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username")
  res.redirect("/urls")
});

app.listen(PORT, () => { //telling server to listen to this port 
  console.log(`Example app listening on port ${PORT}!`);
});

//req.params = an object that holds all the parameters from the URL 
// <%= id %> is a dynamic tag that brings in the variable 
//res.render('____') brings and connects the ejs file with the server file 