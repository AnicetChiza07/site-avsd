// ===========================================
// MODÈLE ARTICLE
// ===========================================

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Le slug est obligatoire'],
        unique: true,
        trim: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Le contenu est obligatoire']
    },
    image: {
        type: String,
        required: [true, 'L\'image est obligatoire']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La catégorie est obligatoire']
    },
    readTime: {
        type: String,
        default: '5 min'
    },
    featured: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    // NOUVEAU : Informations sur l'auteur
    author: {
        name: {
            type: String,
            default: 'AVSD RDC'
        },
        initials: {
            type: String,
            default: 'AVSD'
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Article', articleSchema);