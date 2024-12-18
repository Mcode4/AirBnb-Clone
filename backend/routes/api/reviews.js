const express = require("express");
const router = express.Router();
const { requireAuth } = require('../../utils/auth.js')
const jwt = require('jsonwebtoken')
const { Review } = require('../../db/models');
const { User } = require('../../db/models');
const { Spot } = require('../../db/models');
const { ReviewImage,SpotImage} = require('../../db/models');
const { Model } = require("sequelize");

function getCurrentUser(cookies){
    const { token } = cookies;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return userData = payload.data;
}

//Get all Reviews of the Current User
router.get('/current', requireAuth, async(req, res, next)=>{
    const { user } = req;
    if(!user){
        res.status(400).json({
            message: "No User Logged"
        });
    };

    const reviews = await Review.findAll({
        where:{
            userId: user.id
        },
        include:[
            {
                model:Spot,
                include:[{
                    model:SpotImage,
                    as:'previewImage'
                }]
            },
            {
                model:ReviewImage
            },
            {
                model:User
            }
        ]
     
    });

    if(reviews){
        return res.status(200).json({Reviews: reviews});
    };
    
    return res.status(404).json({
        message: "Reviews couldn't be found"
    });
});


//Add an Image to a Review based on the Review's id
router.post('/:id/images', requireAuth, async(req, res, next)=>{
    const reviewId = req.params.id;
    const { url } = req.body;
    const { user } = req;

    const review = await Review.findByPk(reviewId);
    const imageCount = await ReviewImage.findAndCountAll({where:{reviewId}});

    // Authentication
    if(!review){
        return res.status(404).json({
            message: "Review couldn't be found"
        });
    };
    // Authorization
   if(`${review.userId}` !== `${user.id}`){
        return res.status(403).json({
            message: "User not authorized"
        });
    };

    // console.log('---->', imageCount.count);
    if(imageCount.count >= 10){
        return res.status(403).json({
            message: "Maximum number of images for this resource was reached"
        });
    };

    if(!url){
        return res.status(400).json({
            message: "Invalid url"
        });
    };

    const image = await ReviewImage.create({
        reviewId,
        url
    });
    return res.status(201).json({
        id: image.id,
        url: image.url
    });
    
});


//Edit a Review
router.put('/:id', requireAuth, async(req, res, next)=>{
    const { review, stars } = req.body;
    const currReview = await Review.findByPk(req.params.id);

    const { user } = req;
    const errors = {};

    //Authentication
    if(!currReview){
        return res.status(404).json({
            message: "Review couldn't be found"
        });
    };

    if(!review || review === ""){
        errors.review = "Review text is required"
    };
    if(Number(stars) === NaN || stars > 5 || stars < 0){
        errors.stars = "Stars must be an integer from 1 to 5"
    };
    if(Object.keys(errors).length > 0){
        return res.status(400).json({
            message: "Bad Request",
            errors
        });
    };
    //Authorization
    if(`${currReview.userId}` === `${user.id}`){
        await currReview.update({review, stars});
        return res.status(200).json(currReview);
    };

    
    return res.status(403).json({
        message: "User not authorized"
    });
});


//Delete a Review
router.delete('/:id', requireAuth, async(req, res, next)=>{
    const review = await Review.findByPk(req.params.id);
    const { user } = req;

    //Authentication
    if(!review){
        return res.status(404).json({
            message: "Review couldn't be found"
        });
    };
    // Authorization
   if(`${review.userId}` === `${user.id}`){
        await review.destroy()
        return res.status(200).json({
            message: "Successfully deleted"
        });
    };
    
    return res.status(403).json({
        message: "User not authorized"
    });
});


module.exports = router