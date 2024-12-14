'use strict';
const { Review } = require('../models');
const { User,Spot } = require('../models');
const bcrypt = require("bcryptjs");

const reviewData = [
  {
    // spotId: 1,
    name:'moon hotel',
    username: "Demo-lition",
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

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

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
   for(let reviews of reviewData){
    const {username, name,review, stars} = reviews
    const foundUser = await User.findOne({
      where:{
        username
      }
    });
    const foundspot = await Spot.findOne({
      where:{
        name
      }
    });
    console.log(foundspot);
    await Review.create({
      'userId': foundUser.id,
      'spotId':foundspot.id,
      review,
      stars
    })
   }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    options.tableName = 'Users';
    return queryInterface.bulkDelete(options,null,{});
  }
};
