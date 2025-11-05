import partnerController from '../controllers/partner.controller';
import { Router } from 'express';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType').isIn([ 'car', 'motorcycle', 'auto' ]).withMessage('Invalid vehicle type')
],
    partnerController.registerPartner
)


router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    partnerController.loginPartner
)


router.get('/profile', authMiddleware.authPartner, partnerController.getPartnerProfile)

router.get('/logout', authMiddleware.authPartner, partnerController.logoutPartner)


module.exports = router;