const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
    check('username')
      .exists({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
      .not()
      .isEmail()
      .withMessage('Username cannot be an email.'),
    check('password')
      .exists({ checkFalsy: true })
      .isLength({ min: 6 })
      .withMessage('Password must be 6 characters or more.'),
    handleValidationErrors
  ];

  router.post(
    '/',
    validateSignup,
    async (req, res) => {
      const { email, password, username, firstName, lastName } = req.body;
      const errors = {};

      if(await User.findOne({where:{username}})||await User.findOne({where:{email}})){
        if(await User.findOne({where:{email}})){
          errors.email = "User with that email already exists"
        }
        if(await User.findOne({where:{username}})){
          errors.username = "User with that username already exists"
        }
        
        res.status(500).json({
          message: "User already exists",
          errors
        })
      }

      if(!email.includes('@')){
        errors.email = "Invalid email"
      }
      if(!username){
        errors.username = "Username is required"
      }
      if(!firstName){
        errors.firstName = "First Name is required"
      }
      if(!lastName){
        errors.lastName = "Last Name is required"
      }
      if(Object.keys(errors).length >0){
        res.status(400).json({
          message: "Bad Request",
          errors
        })
      }

      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ email, username, hashedPassword, firstName, lastName });
  
      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };
  
      await setTokenCookie(res, safeUser);
      
      res.status(201)
      return res.json({
        user: safeUser
      });
    }
);


module.exports = router;