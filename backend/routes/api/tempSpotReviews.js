const express = require('express')
const router = express.Router()
const { Spot, Review, User, ReviewImage } = require('../../db/models');
const { Model } = require('sequelize');
const getCurrentUser = require('./reviews')
// Route: /:id/reviews 


//Get all Reviews by a Spot's id
router.get('/:id/reviews ', async(req, res, next)=>{
    const reviews = await Review.findAll({
        where: {
            spotId: req.params.id
        },
        includes: [
            {
                Model: User
            },
            {
                Model: ReviewImage
            }
        ]
    });
    if(!reviews){
        res.status(404).json({
            message: "Spot couldn't be found"
        });
    };


    res.json({
        reviews
    });
});

// Create a Review for a Spot based on the Spot's id
router.post('/:id/reviews', async(req, res, next)=>{
    const spotId = req.params.id;
    const spot = await Spot.findByPk(spotId);
    if(!spot){
        res.status(404).json({
            message: "Spot couldn't be found"
        });
    };

    const userId = getCurrentUser(req.cookies).id;
    const {review, stars} = req.body;
    const errors = {};

    if(!review || review === ""){
        errors.review = "Review text is required"
    };
    if(Number(stars)=== NaN || stars>5 || star<0){
        errors.stars = "Stars must be an integer from 1 to 5"
    };

    if(Object.keys(errors).length >0){
        res.status(400).json({
            message: "Bad Request",
            errors
        });
    };


    const newReview = await Review.create({
        spotId,
        userId,
        review,
        stars
    });

    res.status(201).json(newReview);
});




module.exports = router