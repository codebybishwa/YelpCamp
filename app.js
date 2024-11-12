const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');
const { title } = require('process');
const session = require('express-session');
const flash = require('connect-flash');

const campgrounds = require('./routes/campgrouds')
const reviews = require('./routes/reviews')


app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'itisasecret!!',
  resave: false,   // Setting to false prevents resaving the session if it wasn’t modified, which can help with performance.
  saveUninitialized: true,  // Setting to true means sessions that are new but unmodified will be saved, which is useful when you need to track anonymous users.
  cookie: {
    httpOnly: true,  // When set to true, this helps mitigate the risk of client-side scripts accessing the cookie, which improves security.
    maxAge: 1000 * 60 * 60 * 24 * 7  // Sets the lifespan of the cookie.
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.engine('ejs', ejsMate);


main().catch(err => console.log(err));


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log("Database is working fine");
}

const validateCampground = (req, res, next) => {
  
  const {error} = campgroundSchema.validate(req.body);
  if(error) {
     const msg = error.details.map(element => element.message).join(',');
     throw new ExpressError(msg, 400);
  }
  else {
    next();
  }
}

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.send("Hello from YelpCamp");
});



// if we don't find amy page then we will throw this error
app.all("*", (req, res, next) => {
  next(new ExpressError('Page not found!!', 404));
})


// This is crucial. It's the error handling middleware
app.use((err, req, res, next) => {
  const {statusCode = 500} = err;
  if(!err.message) err.message = "Something went wrong";

  res.status(statusCode).render('error', {err});  // rendering my error template (error.ejs)
})


app.listen(3000, () => {
  console.log("Server working!!!");
});
