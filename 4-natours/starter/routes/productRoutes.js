const express = require('express');
const productController = require('./../controllers/productController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/product-stats')
  .get(productController.getProductStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect,
      authController.restrictTo('admin', 'chief-cheese-maker'),
      productController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(productController.aliasTopProducts, productController.getAllProducts);

router.route('/products-within/:distance/center/:latlng/unit/:unit')
    .get(productController.getProductWithin);
router.route('/distances/:latlng/unit/:unit').get(productController.getDistances);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(authController.protect,
      authController.restrictTo('admin', 'guide'),
      productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
      authController.protect,
      authController.restrictTo('admin'),
      productController.uploadProductImages,
      productController.resizeProductImages,
      productController.updateProduct)
  .delete(
      authController.protect,
      authController.restrictTo('admin'),
      productController.deleteProduct);


module.exports = router;