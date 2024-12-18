const express = require('express');

const router = express.Router();

const {Spot,  User,Booking,SpotImage} = require('../../db/models');

const { requireAuth,restoreUser, setTokenCookie } = require('../../utils/auth');

router.delete('/:imageId', async (req,res)=>{
    const imageid = req.params.imageId;
    const {user} = req;
    if(!user){
        res.status(401);
        return res.json({
            'message':'you havent log in'
        })
    }
    const foundSpotImage = await SpotImage.findByPk(Number(imageid));
    if(!foundSpotImage) {
        res.status(404);
        return res.json(
            {
                "message": "Spot Image couldn't be found"
              }
        )
    }
    const foundSpot = await Spot.findOne({
        where:{
            id:foundSpotImage.spotId
        }
    });
    if(foundSpot.ownerId !== user.id){
        res.status(403);
        return res.json({
            'message':"it is not your spot"
        })
    }
    await foundSpotImage.destroy();
    res.status(200);
    res.json(
        {
            "message": "Successfully deleted"
          }
    )
})


module.exports = router;