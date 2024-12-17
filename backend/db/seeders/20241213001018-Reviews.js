'use strict';

const { User, Spot, Review } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const reviewData = [
  {
    // spotId: 1,
    name:'moon hotel',
    username: 'Demo-lition',
    review: "Great",
    stars: 5
  },
  {
    // userId:1,
    username: 'Demo-lition',
    name:'moon hotel',
    // spotId:2,
    review: 'like it',
    stars: 3
  },
  {
    // userId:2,
    username: 'Demo-lition',
    name:'moon hotel',
    // spotId:1,
    review: 'not like it',
    stars: 5
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
     * 
    */
    for(let data of reviewData){
      const {username, name,review, stars} = data

      const foundUser = await User.findOne({where:{ username }});
      const foundSpot = await Spot.findOne({where:{ name }});
      
      await Review.create({
        'userId': foundUser.id,
        'spotId': foundSpot.id,
        review,
        stars
      }, options);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options,null,{});
  }
};
