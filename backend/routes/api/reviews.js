const express = require("express");
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js')
const jwt = require('jsonwebtoken')
const { Review } = require('../../db/models');
const { User } = require('../../db/models');
const { Spot } = require('../../db/models');
const { ReviewImage} = require('../../db/models');

function getCurrentUser(cookies){
    const { token } = cookies;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return userData = payload.data;
}

//Get all Reviews of the Current User
router.get('/current', async(req, res, next)=>{

    const userId = await getCurrentUser(req.cookies).id;
    
    // Authentication
    if(!userId){
        res.status(400).json({
            message: "Must login. No current user"
        });
    };

    const reviews = await Review.findAll({
        
        where:{
            userId
        },
        
        includes: [
            {model: User},
            {model: Spot},
            {model: ReviewImage}
        ]
    });

    res.status(200).json({Reviews: reviews});
});

//Add an Image to a Review based on the Review's id
router.post('/:id/images', async(req, res, next)=>{
    const reviewId = req.params.id;
    const { url } = req.body;

    // Authentication
    if(!url.includes('www.') || !url.includes('.com')){
        res.status(400).json({
            message: "Invalid url"
        });
    };

    const review = await Review.findByPk(reviewId);
    const userId = await getCurrentUser(req.cookies).id;
    if(!review){
        res.status(404).json({
            message: "Review couldn't be found"
        });
    };

    // Authorization
    if(`${review.userId}` !== `${userId}`){
        res.status(403).json({
            message: "User not authorized"
        });
    };

    const image = await ReviewImage.create({
        reviewId,
        url
    });
    const id = image.id;
    res.status(201).json({
        id,
        url: url
    });
    
});


//Edit a Review
router.put('/:id', async(req, res, next)=>{
    const { review, stars } = req.body;
    const currReview = await Review.findByPk(req.params.id);
    const errors = {};

    if(!currReview){
        res.status(404).json({
            message: "Review couldn't be found"
        });
    };
    const userId = await getCurrentUser(req.cookies).id;
    
    // Authorization
    if(`${currReview.userId}` !== `${userId}`){
        res.status(403).json({
            message: "User not authorized"
        });
    };

    if(!review || review === ""){
        errors.review = "Review text is required"
    };
    if(Number(stars) === NaN || stars > 5 || stars < 0){
        errors.stars = "Stars must be an integer from 1 to 5"
    };
    if(Object.keys(errors).length > 0){
        res.status(400).json({
            message: "Bad Request",
            errors
        });
    };

    await currReview.update({review, stars});

    res.status(200).json(currReview);
});


//Delete a Review
router.delete('/:id', async(req, res, next)=>{
    const review = await Review.findByPk(req.params.id);
    if(!review){
        res.status(404).json({
            message: "Review couldn't be found"
        });
    };
    const userId = await getCurrentUser(req.cookies).id;
   
    // Authorization
   if(`${review.userId}` !== `${userId}`){
        res.status(403).json({
            message: "User not authorized"
        });
    };


    await review.destroy()

    res.status(200).json({
        message: "Successfully deleted"
    });
});





module.exports = router