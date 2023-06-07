const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

// Set headers Policy for mapbox scripts
const CSP = 'Content-Security-Policy';
const POLICY =
    "default-src 'self' https://*.mapbox.com ;" +
    "base-uri 'self';block-all-mixed-content;" +
    "font-src 'self' https: data:;" +
    "frame-ancestors 'self';" +
    "img-src http://localhost:8000 'self' blob: data:;" +
    "object-src 'none';" +
    "script-src https: cdn.jsdelivr.net cdnjs.cloudflare.com api.mapbox.com 'self' blob: ;" +
    "script-src-attr 'none';" +
    "style-src 'self' https: 'unsafe-inline';" +
    'upgrade-insecure-requests;';

router.use((req, res, next) => {
    res.setHeader(CSP, POLICY);
    next();
});


router.get('/signup', viewsController.getRegisterUserForm);
router.get('/login', viewsController.getLoginUserForm);

router.use(authController.isLoggedIn);


//All roles
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-orders', authController.protect, viewsController.getMyOrders);
router.get('/',bookingController.createBookingCheckOut, viewsController.getOverview);
router.get('/products/:productName', viewsController.getProduct);
router.get('/me/reviews/:userId', authController.protect, viewsController.getMyReviews);
router.get('/billing', authController.protect, viewsController.getMyBilling);
router.get('/me/reviews/:userId/change/:reviewId', authController.protect, viewsController.getChangeMyReviews);
//admin
router.get('/adminboard', authController.protect, authController.restrictTo('admin'), viewsController.getAdminBoard);
router.get('/product-manage', authController.protect, authController.restrictTo('admin'), viewsController.getProductManage);


module.exports = router;