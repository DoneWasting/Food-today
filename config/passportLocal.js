const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {

    passport.use( new LocalStrategy({ usernameField: 'email'} , async (email, password, done) => {
        try {
            // Match User
            const matchedUser = await User.findOne( { email: email});
            if(!matchedUser) {
                return done(null, false, { message:'That email is not registered'});
            }

            // Match password
            bcrypt.compare(password, matchedUser.password, (err, isMatch) => {
                if(err) throw err;

                if(isMatch) {
                    console.log('User loggedIn');
                    return done(null, matchedUser);
                } else {
                    console.log('incorrect password');
                    return done(null, false, { message: 'Password incorrect'});
                }
            });
        } catch (err) {
            console.log(err);
            res.render('error/500');
        }
    })
);
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
    });
};