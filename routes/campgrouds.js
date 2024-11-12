const mongoose = require('mongoose');
const express = require('express');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require('../schemas');
const Campground = require('../models/campground');

const router = express.Router();

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

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  }));
  
  
  router.get('/new', (req, res) => {
    res.render('campgrounds/new');
  });
  
  
  router.post('/', validateCampground, catchAsync(async (req, res) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
  
    const campground = new Campground(req.body.campground);
    await campground.save();

    req.flash("success", "Successfully made a campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }));
  
  
  router.get('/:id', catchAsync(async (req, res) => {
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
  
  
  router.get('/:id/edit', catchAsync(async (req, res) => {
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
  
  
  router.put('/:id', validateCampground, catchAsync(async (req, res) => {
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
  
  
  router.delete('/:id', catchAsync(
    async (req, res) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
      }
      await Campground.findByIdAndDelete(id);
      res.redirect('/campgrounds');
    }
  ));


module.exports = router;
 