const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');


const app = express();
const port = 3001;
const HydraStrategy = require('../lib/strategy');
const passport = require('passport');

const sess = {
  secret: 'keyboard cat', cookie: {}
};

app.use(passport.initialize());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(sess));
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.use('hydra', new HydraStrategy({
  clientID: 'auth-code-client6', clientSecret: 'secret', baseURL: 'http://127.0.0.1:4444', scope: 'openid'
}, (accessToken, rt, profile, cb) => {
  cb(null, {email: profile.emails[0]});
}));

app.get('/', (req, res) => {
  res.send('ok');
});

app.get('/login', passport.authenticate('hydra', {
  successRedirect: '/', failureRedirect: '/login'
}));

app.get('/login/callback', passport.authenticate('hydra', {
  failureRedirect: '/login'
}), (req, res) => {
  console.log('callback');
  res.send('oooook');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
