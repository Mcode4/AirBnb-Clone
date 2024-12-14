'use strict';

const { Spot, User } = require('../models');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

const spotData = [
  {
    // ownerId:1,
    userName: 'Demo-lition',
    address:'mars',
    city:'mars_x',
    state:'CA',
    country:'Mars',
    lat:0.4,
    lng:2.3,
    name:'mars hotel',
    description:'transportion is excluded',
    price:200
  },
  {
    // ownerId:2,
    userName: 'FakeUser1',
    address:'moon',
    city:'moon_x',
    state:'CA',
    country:'Moon',
    lat:0.4,
    lng:2.3,
    name:'moon hotel',
    description:'transportion is excluded',
    price:100
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
  //  await Spot.bulkCreate(spotData,{validate:true})
    for(let spotsingle of spotData){
      const {address,city,state,country,lat,lng, name,description,price} = spotsingle;
      const founduser = await User.findOne({
        where :{
          username : spotsingle.userName
        }
      });
      await Spot.create({
        address,city,state,country,lat,lng, name,description,price,'ownerId':founduser.id
      },options)
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
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
