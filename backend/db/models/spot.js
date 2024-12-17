'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.hasMany(models.Review,{foreignKey:'spotId'});
      Spot.hasMany(models.Booking,{foreignKey:'spotId'});
      Spot.hasMany(models.SpotImage,{foreignKey:'spotId'});
      Spot.belongsTo(models.User,{foreignKey:'ownerId'})
    }
  }
  Spot.init({
    ownerId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    address: {
      type:DataTypes.STRING
    },
    city: {
      type:DataTypes.STRING
    },
    state: {
      type:DataTypes.STRING
    },
    country: {
      type:DataTypes.STRING},
    lat: {
      type:DataTypes.DECIMAL,
      validate:{
        len:[-90,90]
      }
    },
    lng: {
      type:DataTypes.DECIMAL,
      validate:{
        len:[-180,180]
      }
    },
    name: {
      type:DataTypes.STRING(50),
      unique:true
    },
    description: {
      type:DataTypes.STRING},
    price: {
      type:DataTypes.DECIMAL,
      validate:{
        isPositive(value){
             if(value<=0) throw new Error('price is larger than 0');
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};