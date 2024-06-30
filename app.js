const express = require('express');
const app = express();
const path = require('path');
const Campground = require('./models/campground')

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log("Database working fine");
}


app.get('/', (req, res) => {
    res.send("hello from yelpcamp");
})

app.get('/makeCampground', async (req, res) => {
    const camp = new Campground({title: "My home"});
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => {
    console.log("Server Working!!!");
})