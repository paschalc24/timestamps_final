import passport from 'passport';
import passportLocal from 'passport-local';
import DB from './database.js';

const { Strategy } = passportLocal;

// Passport Configuration
// Create a new LocalStrategy object to handle authentication using username and
// password credentials from the client. The LocalStrategy object is used to
// authenticate a user using a username and password.
const strategy = new Strategy(async (username, password, done) => {
  const userFound = await DB.findUser(username);
  const passwordValidated = await DB.validatePassword(username, password);
  console.log("USER FOUND", userFound)
  console.log("PASSWORD VALIDATED", userFound)
  if (!userFound) {
    console.log("USER NOT FOUND IN STRATEGY")
    // no such user
    return done(null, false, { message: 'Wrong username' });
  }
  if (!passwordValidated) {
    console.log("PW NOT VALIDATED IN STRATEGY")
    // invalid password
    // should disable logins after N messages
    // delay return to rate-limit brute-force attacks
    await new Promise((r) => setTimeout(r, 2000)); // two second delay
    return done(null, false, { message: 'Wrong password' });
  }
  // success!
  // should create a user object here, associated with a unique identifier
  console.log("STRATEGY SUCCESSFUL");
  return done(null, username);
});

// Configure passport to use the LocalStrategy object.
// The LocalStrategy object is used to authenticate a user using a username and
// password. There are other strategies available, but this is the simplest.
passport.use(strategy);

// Convert user object to a unique identifier.
passport.serializeUser((user, done) => {
  done(null, user);
});

// Convert a unique identifier to a user object.
passport.deserializeUser((uid, done) => {
  done(null, uid);
});

export default {
  configure: (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
  },

  authenticate: (domain, where) => {
    return passport.authenticate(domain, where);
  },
};