'use strict';

const { SpotImage,Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const spotIm = [
  {
    // spotId:1,
    name:'mars hotel',
    url:'www.example.com',
    preview:true
  },
  {
    // spotId:1,
    name:'mars hotel',
    url:'www.example.com',
    preview:false
  }
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    //  await SpotImage.bulkCreate(spotIm,{
    //   validate:true
    //  });
    for(let spot of spotIm){
      const {name,url,preview} = spot;
      const foundspot = await Spot.findOne({
        where:{
          name
        }
      });
      console.log(foundspot.id);
      await SpotImage.create({
        "spotId":foundspot.id,url,preview
      },options)
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete(options,null,{});
  }
};
