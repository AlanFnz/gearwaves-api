/* eslint-disable prettier/prettier */
const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getCheckoutSession, getAllPurchases, createPurchase, getPurchase, updatePurchase, deletePurchase } = require('../controllers/purchaseController');

const router = express.Router();

router.use(protect);

router.get('/checkout-session/:productId', getCheckoutSession);

router.use(restrictTo('admin', 'sales'));

router
  .route('/')
  .get(getAllPurchases)
  .post(createPurchase);

router
  .route('/:id')
  .get(getPurchase)
  .patch(updatePurchase)
  .delete(deletePurchase);

module.exports = router;
