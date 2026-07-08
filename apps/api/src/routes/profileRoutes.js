import express from 'express';
import {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);

export default router;