const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const connection=require('../routes/database')
const ensureAuthenticated = require('./authMiddleware');
const router = express.Router();

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('autodevops4', 'admin', 'admin123', {
  host: '192.168.43.173',
  dialect: 'mysql'
});

const User = require('../models/user')(sequelize, DataTypes);
const gitcredentials = require('../models/gitcredentials')(sequelize, DataTypes);



passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET_KEY,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ where: { id: profile.id } });
  
        if (!user) {
          user = await User.create({
            id: profile.id,
          });

          await gitcredentials.create({
            userId: profile.id,
            gitUsername: profile.username,
            gitToken: accessToken,
          });
        }else{
          let GitCredentials= await gitcredentials .findOne({ where: { userId: user.id} });
          await GitCredentials.update({ gitToken: accessToken });
        }
  
        

        console.log(profile);
        return cb(null, user);
      } catch (error) {
        return cb(error);
      }
    }
  )
);

router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/callback',
  passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/github/success');
  }
);

router.get('/success', ensureAuthenticated ,async (req, res) => {
  // const userInfo = {
  //   id: req.session.passport.user.id,
  //   displayName: req.session.passport.user.username,
  //   provider: req.session.passport.user.provider,
  // };

  res.render('success', { title:"success" });
});

router.get('/error', (req, res) => res.send('Error logging in via Github..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('auth');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});

module.exports = router;