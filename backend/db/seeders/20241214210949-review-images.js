'use strict';
const { ReviewImage, Review } = require('../models')
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const reviewImages = [
  {
    reviewId: 1,
    url: 'www.example.com'
  },
  {
    reviewId: 2,
    url: 'www.example.com'
  },
  {
    reviewId: 3,
    url: 'www.example.com'
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
    for(let review of ReviewImage){
      const {reviewId, url} = review
      const currReview = Review.findByPk(reviewId)
      console.log(`Current Review: ${currReview}, Comment: ${currReview.review}`)

      await ReviewImage.create({
        reviewId: currReview.id,
        url
      }, options)
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete(options, null, {});
  }
};
