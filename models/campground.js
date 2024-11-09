const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// We are doing this because once we delete a model then we also need to delete all reviews associated with that
// 'findOneAndDelete' middleware gets triggered when we do findByIdAndDelete
CampgroundSchema.post('findOneAndDelete', async (doc) => {
     if(doc) {
        await Review.deleteMany({
            _id: {$in: doc.reviews}
        })
        console.log("All associated reviews deleted")
     }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
