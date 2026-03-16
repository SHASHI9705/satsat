import { Router } from 'express';
import multer from 'multer';
import {
  createUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  updateUserPaymentStatus,
  deleteUser,
} from '../controllers/userController';
import {
  createLogin,
  getAllLogins,
  getLoginById,
  updateLogin,
  deleteLogin,
  requestOtp,
  verifyOtp, // Import handleSendOtp
} from '../controllers/loginController';

const router: Router  = Router();
const upload = multer();

router.post(
  '/users',
  upload.fields([
    { name: 'passportPhoto', maxCount: 1 },
    { name: 'resumePdf', maxCount: 1 },
    { name: 'salarySlip', maxCount: 1 },
  ]),
  createUser
);

router.get('/users', getAllUsers);
router.get('/users/:email', (req, res) => {
  getUserByEmail(req, res);
});
router.put('/users/:email', (req, res) => {
  updateUser(req, res);
});
router.put('/users/:email/payment', updateUserPaymentStatus);
router.delete('/users/:email', (req, res) => {
  deleteUser(req, res);
});

// Login routes
router.post('/login', createLogin); // Create login
router.get('/logins', getAllLogins); // Get all logins
router.get('/login/:id', getLoginById); // Get login by ID
router.put('/login/:id', updateLogin); // Update login
router.delete('/login/:id', deleteLogin); // Delete login
router.post('/login/request-otp', requestOtp); // Request OTP
router.post('/login/verify-otp', verifyOtp); // Verify OTP


export default router;