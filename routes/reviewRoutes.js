/* eslint-disable prettier/prettier */
const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setProductUserIds,
  getReview
} = require('../controllers/reviewController');
const { restrictTo, protect } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(setProductUserIds, getAllReviews)
  .post(restrictTo('user'), setProductUserIds, createReview);

router
  .route('/:id')
  .get(setProductUserIds, getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview); 

module.exports = router;
