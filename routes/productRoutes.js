/* eslint-disable prettier/prettier */
const express = require('express');
const {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  aliasTopProducts,
  getProductStats,
  getProductsWithin,
  getDistances,
  uploadProductImages,
  resizeProductImages
} = require('../controllers/productController');
const {
  protect,
  restrictTo,
} = require('../controllers/authController');
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(aliasTopProducts, getAllProducts);

router.route('/product-stats').get(getProductStats);

router
  .route('/products-within/:distance/center/:latlng/unit/:unit')
  .get(getProductsWithin);

router
  .route('/distances/:latlng/unit/:unit')
  .get(getDistances);

router
  .route('/')
  .get(getAllProducts)
  .post(protect, restrictTo('admin', 'lead-guide'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadProductImages, resizeProductImages, updateProduct)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteProduct);

module.exports = router;
