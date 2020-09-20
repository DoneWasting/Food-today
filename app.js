const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const morgan = require('morgan');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const session = require('express-session');
// MUST BE Below express-session
const MongoStore = require('connect-mongo')(session);

const runEveryDay = require('./timedFunctions/timedFunctions');


const app = express();


// Passport config
require('./config/passportLocal')(passport);

// Session MUST BE ABOVE PASSPORT MIDDLEWARE
app.use(session({
  secret: process.env.MY_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection})
}));



app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function(req, res, next) {
  if(req.user) {
    res.locals.user = {
      firstName:req.user.firstName,
      lastName: req.user.lastName,
      _id: req.user._id
      }
  } else {
    res.locals.user = null;
  }
   
  next();
});

// Config
dotenv.config({ path: './config/config.env'});

// Connecting to db
const connectDB = require('./config/db');
connectDB();

// Loggin processes for debugging
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

// Body parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// Method Override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method;
    }
  }));
// Requiring Helpers
const {typeOf, errorCheck, flashMsg, isLoggedIn, isUserCreator, isLoggedOut, add, substractOne, pagination, paginationArrowsNext, paginationArrowsPrev, userHasCart} = require('./helpers/hbs');
  
//Handlebars
app.engine('.hbs', exphbs({ 
  helpers: {
    typeOf,
    errorCheck,
    flashMsg,
    isLoggedIn,
    isUserCreator,
    isLoggedOut,
    add,
    substractOne,
    pagination,
    paginationArrowsNext,
    paginationArrowsPrev,
    userHasCart
} ,
defaultLayout: 'main',
extname: '.hbs'
}));
app.set('view engine', '.hbs');

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.upload_error = req.flash('upload_error');
    res.locals.success_added_cart_msg = req.flash('added_to_cart');
    next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/markets', require('./routes/market'));
app.use('/products', require('./routes/product'));
app.use('/users', require('./routes/user'));
app.use('/search', require('./routes/search'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));