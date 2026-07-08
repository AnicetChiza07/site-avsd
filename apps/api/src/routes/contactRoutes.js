// ===========================================
// ROUTES DES CONTACTS
// ===========================================

import express from 'express';
import {
    getContacts,
    getContactById,
    createContact,
    markAsRead,
    markAsUnread,
    deleteContact
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route publique (création de contact depuis le site)
router.post('/', createContact);

// Routes protégées (admin)
router.get('/', protect, getContacts);
router.get('/:id', protect, getContactById);
router.patch('/:id/read', protect, markAsRead);
router.patch('/:id/unread', protect, markAsUnread);
router.delete('/:id', protect, deleteContact);

export default router;