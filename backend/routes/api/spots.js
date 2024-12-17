const express = require('express');

const router = express.Router();

const {Spot, Review,sequelize,ReviewImage,SpotImage, User,Booking} = require('../../db/models');
const { Op } = require("sequelize");
const { requireAuth,restoreUser, setTokenCookie } = require('../../utils/auth');

router.get('/:spotId/bookings', requireAuth,async (req, res)=>{
    const spotid = req.params.spotId;
    const {user} = req;
    const foundBooking = await Booking.findOne({
        where:{
            spotId:Number(spotid)
        },
        // limit:1
    });
    // res.json(foundBooking);
  
    if(user.id !== foundBooking.userId){
        res.status(200);
        return res.json({
            foundBooking 
        })
    }
    if(user.id === foundBooking.userId) {
        const theuser = await User.findByPk(user.id);
        res.status(200);
        return res.json({
            "Bookings":[
                {
                    "User":theuser,
                  ...foundBooking.toJSON()  
                }
            ]
        })
    }
 

})

router.get('/:spotId/reviews', async (req, res)=>{
    const spotid = req.params.spotId;
    const foundReviews = await Review.findOne({
        where:{
            spotId:Number(spotid)
        },
        include:[
            {
                model:User
            },
            {
                model:ReviewImage
            }
        ]
    });
    if(foundReviews){
        res.status(200)
        return res.json({
            foundReviews
        })
    }

    res.status(404);
    res.json({
        "message": "Spot couldn't be found"
      });
   
});


router.get('/current', async (req, res)=>{
    
    // console.log(secretKey);
    const { user } = req;
    console.log(user);
  
  
    if(user){
      try{
     
      const foundSpot = await Spot.findAll({
        attributes:['id','ownerId','address','city','state','country','lat','lng','name', 'description','price','createdAt','updatedAt',[sequelize.fn('AVG',sequelize.col('stars')),'avgRating']],
    
        where:{
          ownerId:user.id
        },
        include:[{
                  model:Review,
              },
              {
                 model: SpotImage,
                 as:'previewImage',
               
               
              }],
   
      })
      res.setHeader('Content-Type','application/json');
      res.json({
     
         "Spots": foundSpot
        
      });
  
      }catch(error){
         
        return res.json(error);
      
        // res.json({
        //   "message": "Spot couldn't be found"
        // });
      }
      }
      else{
        res.setHeader('Content-Type','application/json');
        res.status(401);
        return res.json(user)
    }
    
    return res.json(user)
  });


router.get('/:spotId', async (req,res)=>{

    const spotid = req.params.spotId;
    console.log('======>',spotid);
    const foundspot = await Spot.findOne({
        attributes:['id','ownerId','address','city','state','country','lat','lng','name', 'description','price','createdAt','updatedAt',[sequelize.fn('AVG',sequelize.col('stars')),'avgStarRating'],[sequelize.fn('SUM',sequelize.col('review')),'numReviews']],
        where:{
            id: Number(spotid)
        },
        include:[
            {
                model:Review,
                attributes:[],
            },
            {
                model:SpotImage,
                as:'previewImage',
                attributes:['id','url','preview'],
                // where:{
                //     id:Number(spotid)
                // }
            },
            {
                model:User,
                as: 'Owner',
                attributes:['id','firstName','lastName'],
              
            }
        ]
    })
    console.log("foundspot",foundspot)

    if(!foundspot.id){
        res.status(404);
        res.setHeader('Content-Type','application/json');
        return res.json({
            "message": "Spot couldn't be found"
          })
    }
    
    const {previewImage,...rest} = foundspot.toJSON();
    const formatFoundSpot = {...rest,'SpotImages':previewImage}
    res.status(200);
    res.setHeader('Content-Type','application/json');
    res.json(formatFoundSpot);
})








router.get('/', async (req, res)=>{


    // const { user } = req;
    // console.log(user);
    const page = req.query.page || 1;
    const size = req.query.size || 20;
    const offset = (Number(page)-1)*Number(size);
    let where = {};
    const minlat = req.query.minLat;
    const maxlat = req.query.maxLat;
    const minLng = req.query.minLng;
    const maxLng = req.query.maxLng;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    if(minlat) {
        where[[Op.gte]]=Number(minlat);
    }
    if(maxlat) where[[Op.lte]] = Number(maxlat);
    if(minLng) where[[Op.gte]]=Number(minLng);
    if(maxLng) where[[Op.lte]] = Number(maxLng);
    if(minPrice) where[[Op.gte]] = Number(minPrice);
    if(maxPrice) where[[Op.lte]] = Number(maxPrice);

    console.log(where);

    const findSpot = await Spot.findAll({
        attributes:['id','ownerId','address','city','state','country','lat','lng','name', 'description','price','createdAt','updatedAt'],
        // where,
       
        include:[{
            model:Review,
            attributes:[[sequelize.fn('AVG',sequelize.col('stars')),'avgRating']],
        },
        {
           model: SpotImage ,
           as:'previewImage',
           attributes:['url'],
         
        }],

        group: ['Spot.id'],
        limit:Number(size),
        offset,
        raw: true, 
        nest: true  
    });

    let newSpot=[];
    for (let thespot of findSpot){
        const {Reviews,...rest} =thespot;
        newSpot.push({
            ...rest,
            "avgRating":Reviews.avgRating
        })
    }

    res.setHeader("Content-Type","application/json");
    res.status(200);
    res.json({"Spots":newSpot,
        page,
        size
    });
});



router.post('/:spotId/images',async (req,res)=>{
    const {user} = req;
    if(!user){
        res.status(401);
        return res.json({"message":'Authentication required'});
    }

    const userSpot = await Spot.findOne({
        where:{
            ownerId:user.id
        }
    })
    if (!userSpot) {
        res.status(403);
        return res.json({
            "message":"you don't have a spot"
        })
    }

    const spotid = req.params.spotId;
    const {url,preview} = req.body;
 
   const spotidSplit =spotid.split('');
//    console.log('=>',spotid,spotidSplit);
   spotidSplit.forEach(el=>{
        console.log(el);
        if(!'0123456789'.includes(el)){
            res.status(403);
            return res.json({
                "message":`${spotid}`
            })
        }
});
   
  
    const foundSpot = await Spot.findByPk(Number(spotid));
    if (!foundSpot) {
        res.status(404);
        return res.json({
            "message": "Spot couldn't be found"
        })
    }

  
    if(foundSpot.ownerId !== user.id) {
        res.status(403);
        return res.json({
            "message":`it is not your spot, your spot is ${userSpot.id}`
        })
    }
   
   try{
    const newSpotImg = await SpotImage.create({"spotId":Number(spotid),url,preview});
    res.setHeader("Content-Type","application/json");
    res.status(201);
   return  res.json(newSpotImg)

   }   catch (error){
    // if (!newSpotImg) {
        res.status(404);
        return res.json(error);
        // return res.json({
        //     "message": "Spot couldn't be found"
        // })
    // }
   } 
        

})

router.use(restoreUser);

router.post('/:spotId/bookings', requireAuth,async (req, res)=>{
    const spotid = req.params.spotId;
    const {startDate,endDate} = req.body;
    const {user} = req;
    const foundSpot = await Spot.findByPk(Number(spotid));

    if(!foundSpot) {
        res.status(404);
        return res.json({
            "message": "Spot couldn't be found"
          })
    }

    if(foundSpot.ownerId === user.id) {
        res.status(200);
        return res.json({
          "message":"the Spot is the owner's, choose another one"
        })
    }
    try{
        const newBooking = await Booking.create({
            "spotId":Number(spotid),"userId":user.id,startDate,endDate
        });
        res.status(201);
        res.json(newBooking)
    }
    catch(error){

        if(error.original.code ==="SQLITE_CONSTRAINT"){
            res.status(403);
            return res.json({
                
                    "message": "Sorry, this spot is already booked for the specified dates",
                    "errors": {
                      "startDate": "Start date conflicts with an existing booking",
                      "endDate": "End date conflicts with an existing booking"
                    }
                  
            })
        }
        res.status(400);

        // return res.json(error.original.code)
        return res.json(
            {
                "message": "Bad Request", 
                "errors": {
                  "startDate": "startDate cannot be in the past",
                  "endDate": "endDate cannot be on or before startDate"
                }
              }
        )
    }
   

})



router.post('/:spotId/reviews', async (req,res)=>{
    const {user} = req;
    if(user){
        const {review, stars} = req.body;
        const spotid = req.params.spotId;

        if(!'0123456789'.includes(spotid)){
          res.status(404);
          return res.json({
            "message": "Spot couldn't be found"
          });
        }
        try{
        const newReview = await Review.create({
            "userId":user.id,"spotId":Number(spotid),review, stars
        });
        res.status(201);
        return res.json({
            newReview 
        })
    }
        catch (error){
            res.status(400);
            return res.json(
                {
                    "message": "Bad Request", 
                    "errors": {
                      "review": "Review text is required",
                      "stars": "Stars must be an integer from 1 to 5",
                    }
                  }
            )
        }
       
       

    }

    if(!user){
       res.status(500);
       return res.json({
        "message": "User already has a review for this spot"
      })
    }
  
})

router.post('/',requireAuth,async (req, res)=>{

    try{
        const {address, city, state, country, lat, lng, name,description, price} = req.body;

        // console.log(req.user);
        
        const newSpot = await Spot.create({
            address, city, state, country, lat, lng, name,description, price,'ownerId':req.user.id
        });
            
      
        // await setTokenCookie(res, safeUser);
        res.status(201);
        return res.json(newSpot);
    }
    catch(error){
        res.status(400);
        res.json({
          "message": "Bad Request", 
          "errors": { 
              "address": "Street address is required",
              "city": "City is required",
              "state": "State is required",
              "country": "Country is required",
              "lat": "Latitude must be within -90 and 90",
              "lng": "Longitude must be within -180 and 180",
              "name": "Name must be less than 50 characters",
              "description": "Description is required",
              "price": "Price per day must be a positive number"
          }
        })
    }
    
});



router.put('/:spotId', async (req, res)=>{

    const {user} = req;
    if(!user){
          res.status(401);
          return res.json({
            "message":"you haven't log in"
          })
    }

     const spodid = req.params.spotId;
    
   
    try{
        const {address, city, state, country,lat,lng,name,description,price}=req.body;
        const theSpot = await Spot.findByPk(spodid);
        if(!theSpot) {
            res.status(404);
            return res.json({
                "message": "Spot couldn't be found"
              })
        }
        if(theSpot.ownerId !== user.id){
            res.status(403);
            return res.json({
                'message':"it is not your spot"
            })
        }

        if (name.length>50 || lat<-90||lat>90||lng<-180||lng>180){
            res.status(400);
        return res.json({
            "message": "Bad Request", 
            "errors": {
              "address": "Street address is required",
              "city": "City is required",
              "state": "State is required",
              "country": "Country is required",
              "lat": "Latitude must be within -90 and 90",
              "lng": "Longitude must be within -180 and 180",
              "name": "Name must be less than 50 characters",
              "description": "Description is required",
              "price": "Price per day must be a positive number"
            }
          })
        }
        if(address) theSpot.address=address;
        if(city) theSpot.city=city;
        if(country) theSpot.country=country;
        if(state) theSpot.state = state;
        if(lat) theSpot.lat =lat;
        if(lng) theSpot.lng =lng;
        if(name) theSpot.name =name;
        if(description) theSpot.description=description;
        if(price) theSpot.price=price;

    
        res.status(200);
        res.json(theSpot);
    }catch(error){
        res.status(400);
        res.json({
            "message": "Bad Request", 
            "errors": {
              "address": "Street address is required",
              "city": "City is required",
              "state": "State is required",
              "country": "Country is required",
              "lat": "Latitude must be within -90 and 90",
              "lng": "Longitude must be within -180 and 180",
              "name": "Name must be less than 50 characters",
              "description": "Description is required",
              "price": "Price per day must be a positive number"
            }
          })
    }
})

router.delete('/:spotId', async (req, res)=>{
    const {user} = req;
    if(!user){
          res.status(401);
          return res.json({
            "message":"you haven't log in"
          })
    }
    const spotid = req.params.spotId;
    const theSpot = await Spot.findByPk(spotid);
  
    if(theSpot){
        if(theSpot.ownerId !== user.id){
            res.status(403);
            return res.json({
                'message':"it's not your spot"
            })
        }
        await theSpot.destroy();
        res.status(200);
        return res.json({
            "message": "Successfully deleted"
          })
    }
    res.status(404);
    return res.json({
        "message": "Spot couldn't be found"
      })
   
})



module.exports = router;