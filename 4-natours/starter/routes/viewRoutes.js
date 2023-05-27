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

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-orders', authController.protect, viewsController.getMyOrders);
router.get('/',bookingController.createBookingCheckOut, viewsController.getOverview);
router.get('/tours/:tourName', viewsController.getTour);
router.get('/adminboard', authController.protect, authController.restrictTo('admin'), viewsController.getAdminBoard);




module.exports = router;