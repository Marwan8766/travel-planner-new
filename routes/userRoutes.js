const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
///////////////////

const router = express.Router();

router.post('/signup', authController.signup);
router.patch('/confirmEmail/:token', authController.confirmEmail);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/reActivateAccount', authController.reActivateAccount);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMe', userController.UpdateMe);
router.patch('/updatePassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.Getuser);
router.delete('/deleteMe', userController.deleteMe, userController.deleteuser);
router.delete('/deleteAccount', authController.deleteAccount);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.GetAllUsers)
  .post(userController.createuser);

router
  .route('/:id')
  .get(userController.Getuser)
  .patch(userController.Updateuser)
  .delete(userController.deleteuser);

// router.get('/me', userController.getMe, userController.Getuser);

module.exports = router;
