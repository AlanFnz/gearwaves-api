/* eslint-disable prettier/prettier */
const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  getExperts,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');
const { 
  signup,
  login,
  logout,
  isLoggedIn,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo
} = require('../controllers/authController');
const { getAllPurchases } = require('../controllers/purchaseController');
const { getAllReviews } = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router
  .route('/signup')
  .post(signup);

router
  .route('/login')
  .post(login);

router
  .route('/logout')
  .get(logout);

router
  .route('/logged')
  .get(isLoggedIn)

router
  .route('/forgotPassword')
  .post(forgotPassword);

router
  .route('/resetPassword/:token')
  .patch(resetPassword);

// Protect all routes from this point
router.use(protect);

router
  .route('/updateMyPassword')
  .patch(updatePassword);

router
  .route('/me')
  .get(getMe, getUser);

router
  .route('/updateMe')
  .patch(uploadUserPhoto, resizeUserPhoto, updateMe);

router
  .route('/deleteMe')
  .delete(deleteMe);

router
  .route('/purchases')
  .get(getAllPurchases)

router
  .route('/reviews')
  .get(getAllReviews)

// Restrict routes from this point
router.use(restrictTo('admin'));

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/experts')
  .get(getExperts)

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
