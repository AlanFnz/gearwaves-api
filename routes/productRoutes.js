/* eslint-disable prettier/prettier */
const express = require('express');
const {
  getAllProducts,
  createProduct,
  getProduct,
  viewProduct,
  updateProduct,
  deleteProduct,
  aliasTopProducts,
  getProductStats,
  getProductsWithin,
  getDistances,
  uploadProductImages,
  resizeImageCover,
  resizeImages
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
  .post(protect, restrictTo('admin', 'sales'), createProduct);

router
  .route('/:id')
  .get(getProduct)
  .patch(protect, restrictTo('admin', 'sales'), uploadProductImages, resizeImages, updateProduct)
  .delete(protect, restrictTo('admin', 'sales'), deleteProduct);

router
  .route('/view/:slug')
  .get(viewProduct)

module.exports = router;
