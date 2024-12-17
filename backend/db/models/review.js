'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Review.belongsTo(models.User, {
        foreignKey: 'userId'
      })
      Review.belongsTo(models.Spot, {
        foreignKey: 'spotId'
      })
      Review.hasMany(models.ReviewImage,{foreignKey:'reviewId'});
    }
  }
  Review.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: DataTypes.STRING,
    stars: DataTypes.INTEGER

    
  }, {
    sequelize,
    modelName: 'Review',
    // defaultScope: {
    //   attributes: [this.id, this.userId, this.spotId, this.review, this.stars, this.createdAt, this.updatedAt]
    // }
  });
  return Review;
};