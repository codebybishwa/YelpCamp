const express = require('express');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {reviewSchema} = require('../schemas');

const Campground = require('../models/campground');
const Review = require('../models/review')

const router = express.Router({mergeParams: true});

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

router.post('/', validateReview, catchAsync(
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
  router.delete('/:reviewId', catchAsync(
    async (req, res) => {
      const {id, reviewId} = req.params;
      await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
      await Campground.findByIdAndDelete(reviewId);
  
      res.redirect(`/campgrounds/${id}`);
    }
  ))

  module.exports = router;