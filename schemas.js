const Joi = require('joi');

// This is not a mongoose schema. It's going to validate our data before involving mongoose.
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    }).required()
  })
