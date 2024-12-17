const express = require("express");
const router = express.Router();
const { ReviewImage } = require('../../db/models')


//Delete a Review Image
router.delete('/:id', async(req, res, next)=>{
    const reviewImg = await ReviewImage.findByPk(req.params.id);
    if(!reviewImg){
        res.status(404).json({
            message: "Review Image couldn't be found"
        });
    };
    const userId = await getCurrentUser(req.cookies).id;
   
    // Authorization
   if(`${review.userId}` !== `${userId}`){
        res.status(403).json({
            message: "User not authorized"
        });
    };


    await reviewImg.destroy()

    res.status(200).json({
        message: "Successfully deleted"
    });
});


module.exports = router