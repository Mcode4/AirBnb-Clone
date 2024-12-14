'use strict';
const { Review } = require('../models');
const { User } = require('../models');
const bcrypt = require("bcryptjs");

const reviewData = [
  {
    spotId: null,
    username: "Demo-lition",
    review: "Great",
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
    const {username, review, stars} = reviews
    const foundUser = await User.findOne({
      where:{
        username
      }
    })
    await Review.create({
      'userId': foundUser.id,
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
