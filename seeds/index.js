const mongoose = require('mongoose');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers.js')
const Campground = require('../models/campground');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log("Database connected!!");
}

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 30;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://picsum.photos/400?random=${Math.random()}`,
      description: "The image captures a serene, idyllic countryside scene at the break of dawn. The sky, painted in a gradient of deep purples fading into soft pinks and oranges, heralds the beginning of a new day. The sun, a glowing orb just peeking over the horizon, casts a golden hue across the landscape, creating a stunning contrast with the cool colors of the early morning sky.",
      price
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
});