const express = require("express");
const passport = require("passport");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("./models");

// Simplified and consolidated passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log(">>>>check abc<<<<<<",profile)
        // Find or create user based on Google profile
        let [user, created] = await User.findOrCreate({
          where: { 
            authGgId: profile.id, 
            authType: "google" 
          },
          defaults: {
            authType: "google",
            email: profile.emails[0]?.value,
            authGgId: profile.id,
            name: profile.displayName
          }
        });

        // Log user creation or login
        console.log(created ? 'New user created' : 'User logged in', user);

        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

// Simplified serialization methods
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;