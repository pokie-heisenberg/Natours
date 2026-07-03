const express = require('express');
const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');
const rateLimiter = require('express-rate-limit');

const router = express.Router();
const rateLimit = rateLimiter({
  max: 5,
  windowMs: 60 * 60 * 1000,
  message: 'Too many login attempts please,try again after 1 hours',
});

router.route('/signup').post(authController.signup);
router.route('/login').post(rateLimit, authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.use(authController.protect);
router.route('/updateMyPassword').patch(authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router
  .route('/updateMe')
  .patch(
    userController.updateUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.delete('/deleteMe', userController.deleteMe);
router.use(authController.restrictedTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
