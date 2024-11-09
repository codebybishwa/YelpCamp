const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas');
const { title } = require('process');
const Review = require('./models/review')


app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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

const validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(element => element.message).join(',');
    throw new ExpressError(msg, 400);
 }
 else {
   next();
 }
}


app.get('/', (req, res) => {
  res.send("Hello from YelpCamp");
});


app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));


app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});


app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
  // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID format');
  }
  const campground = await Campground.findById(id).populate('reviews');
  if (!campground) {
    return res.status(404).send('Campground not found');
  }
  res.render('campgrounds/show', { campground });
}));


app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID format');
  }
  const campground = await Campground.findById(id);
  if (!campground) {
    return res.status(404).send('Campground not found');
  }
  res.render('campgrounds/edit', { campground });
}));


app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID format');
  }
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  if (!campground) {
    return res.status(404).send('Campground not found');
  }
  res.redirect(`/campgrounds/${campground._id}`);
}));


app.delete('/campgrounds/:id', catchAsync(
  async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  }
));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
  }
))

// Our campground contains an array of object ids of reviews. We want to delete the id which corresponds to our deleted review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(
  async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Campground.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${id}`);
  }
))



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
