import 'dotenv/config';
import express from 'express';
import expressSession from 'express-session';
import DB from './database.js';
import auth from './auth.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from 'morgan';

// We will use __dirname later on to send files back to the client.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

let userName = "";

// Create the Express app
const app = express();
const port = process.env.PORT || 3000;

// Session configuration
const sessionConfig = {
  // set this encryption key in Heroku config (never in GitHub)!
  secret: process.env.SECRET || 'SECRET',
  resave: false,
  saveUninitialized: false,
};

app.use(logger('dev'));
// Setup the session middleware
app.use(expressSession(sessionConfig));
// Allow JSON inputs
app.use(express.json());
// Allow URLencoded data
app.use(express.urlencoded({ extended: true }));
// Allow static file serving
app.use(express.static(join(__dirname, '..', 'client')));
// Configure our authentication strategy
auth.configure(app);

// Our own middleware to check if the user is authenticated
function checkLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    // If we are authenticated, run the next route.
    console.log("AUTHENTICATED");
    next();
  } else {
    // Otherwise, redirect to the login page.
    res.redirect('/login');
  }
}

app.get('/', checkLoggedIn, (req, res) => {
  res.send('hello world');
});

// Handle the URL /login (just output the login.html file).
app.get('/login', (req, res) =>
  res.sendFile('client/login.html', { root: __dirname })
);

// Handle post data from the login.html form.
app.post(
  '/login',
  auth.authenticate('local', {
    // use username/password authentication
    successRedirect: '/client', // when we login, go to /client
    failureRedirect: '/login', // otherwise, back to login
  })
);

// Handle logging out (takes us back to the login page).
app.get('/logout', (req, res) => {
  req.logout(); // Logs us out!
  res.redirect('/login'); // back to login
});

// Like login, but add a new user and password IFF one doesn't exist already.
// If we successfully add a new user, go to /login, else, back to /register.
// Use req.body to access data (as in, req.body['username']).
// Use res.redirect to change URLs.
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (DB.addUser(username, password)) {
    res.redirect('/login');
  } else {
    res.redirect('/register');
  }
});

// Register URL
app.get('/register', (req, res) =>
  res.sendFile('client/register.html', { root: __dirname })
);

// Send Javascript to browser
app.get('/home.js', (req, res) =>
  res.sendFile('client/home.js', { root: __dirname })
);

// Private data
app.get(
  '/client',
  checkLoggedIn, // If we are logged in (notice the comma!)...
  (req, res) => {
    // Go to the user's page.
    res.redirect('/client/' + req.user);
  }
);

// I have an express server with passport authentication here:

// A page for the user.
app.get(
  '/client/:userID/',
  checkLoggedIn, // We also protect this route: authenticated...
  async (req, res) => {
    // Verify this is the right user.
    if (req.params.userID === req.user) {
      console.log(`${(process.pid)}: Set User Name on Login`, req.user);
      define_user_post(req.user);
      res.sendFile(`${__dirname}/client/home.html`);
    } else {
      res.redirect('/client/');
    }
  }
);

const define_user_post = (req_user) => {
  app.post(`/client/${req_user}`, checkLoggedIn, async (req, res) => {
    console.log(`${(process.pid)}: Client Posting User Job: ${req.body}`);
    try {
      DB.addJob({...req.body, user:req_user}, res);
      res.redirect(`/client/success`);
    }
    catch (err){
      console.error(err);
      res.redirect(`/client/failure`);
    }
    
  });
}

app.get(`/client/success`, checkLoggedIn, (req, res) => {
  console.log(`${(process.pid)}: Client Post Success`);
  res.status(200).sendFile(`${__dirname}/client/home.html`);
});

app.get(`/client/failure`, checkLoggedIn, (req, res) => {
  console.log(`${(process.pid)}: Client Post Failure`);
  res.status(500).sendFile(`${__dirname}/client/home.html`);
});

app.get('/jobs', async (req, res) => {
  try {
    const jobsArray = await DB.getJobs(res);
    res.status(200).json(jobsArray);
  }
  catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

app.get('*', (req, res) => {
  res.send('Error');
});


app.listen(port, () => {
  console.log(`App now listening at http://localhost:${port}`);
});