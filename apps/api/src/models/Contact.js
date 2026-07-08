// ===========================================
// MODÈLE CONTACT
// ===========================================

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true,
        default: 'Sans objet'
    },
    message: {
        type: String,
        required: [true, 'Le message est obligatoire']
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Contact', contactSchema);