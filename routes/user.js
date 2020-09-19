const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
const router = express.Router();

const { ensureAuthenticated } = require('../middleware/auth');



// Description Show login form
// @Route GET /users/login
router.get('/login', (req, res) => {
    res.render('login');
});

// Description Handle login form
// @Route POST/users/login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/markets',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req, res, next);
});

// Description Show Register form
// @Route GET /users/register
router.get('/register', (req, res) => {
    res.render('register')
});

// Description Handle Register form
// @Route POST/users/register
router.post('/register', async (req, res) => {

    try {
        const {firstName, lastName, email, password, password2} = req.body;
        let errors = [];
        // Validating data
        // Check If any input is not filled
        if(!firstName || !lastName || !email || !password || !password2) {
            errors.push({ msg: 'Please fill in all fields' });
        }
        // Check If passwords don't match
        if(password !== password2) {
            errors.push( { msg: 'Password do not match'});
        }
        // Check if password is at least 7 characters long
        if(password.length < 7) {
            errors.push( { msg: 'Password must be at least 7 characters long'});
        }
        // Check if there are any errors
        if(errors.length > 0) {
            console.log(errors);
            res.render('register', {
                errors,
                firstName,
                lastName,
                email,
                password,
                password2
            });
        } else {
            
            //Validation passed
            let user = await User.findOne({ email: email});
            
            //If user already exists
            if(user) {
                errors.push({ msg: 'Email already registered'});
                
                res.render('register', {
                    errors,
                    firstName,
                    lastName,
                    email,
                    password,
                    password2
                });
            } else {
                // Creating new user
                
                const newUser = await User.create({firstName, lastName, email, password});
                
                // Hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if(err) {
                            console.error(err);
                            res.render('error/500');
                        }
                        newUser.password = hash;
                        await newUser.save();
                        req.flash('success_msg', 'You are now registered and can login.')
                        res.redirect('/users/login');
                    });
                });

            }
        }
    } catch (err) {
        console.log(err);
        res.render('error/500');
    }

});

router.get('/me', ensureAuthenticated, (req, res) => {
    res.render('users/me');
});


router.get('/logout', ensureAuthenticated, (req, res) => {
    req.logout();
    req.flash('success_msg', 'You succesfully logout');
    res.redirect('/users/login');
} );



module.exports = router;