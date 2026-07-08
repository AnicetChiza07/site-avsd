// ===========================================
// MODÈLE ADMIN
// ===========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'editor'],
        default: 'admin'
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password avant sauvegarde
// IMPORTANT : Fonction async sans next() pour Mongoose moderne
adminSchema.pre('save', async function() {
    // Ne hasher que si le mot de passe a été modifié
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model('Admin', adminSchema);