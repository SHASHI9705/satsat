import { Router } from 'express';
import multer from 'multer';
import authMiddleware from '../middleware/corsMiddleware';
import {
  createUser,
  getAllUsers,
  getUserByEmail,
  updateUser,
  updateUserPaymentStatus,
  deleteUser,
  updateApplicationStatus
} from '../controllers/userController';
import {
  handleOtpLogin,
  fetchApplications
} from '../controllers/loginController';

const router: Router  = Router();
const upload = multer();

router.post(
  '/users',
  authMiddleware, // Added middleware to extract user ID from Authorization header
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
router.put('/users/:email/status', (req, res) => {
  updateApplicationStatus(req, res);
});
router.delete('/users/:email', (req, res) => {
  deleteUser(req, res);
});

router.post('/auth/otp-login', handleOtpLogin);
router.get('/applications', fetchApplications);

export default router;