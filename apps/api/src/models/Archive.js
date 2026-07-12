import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true,
        maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'La synthèse est obligatoire'],
        maxlength: [300, 'La synthèse ne peut pas dépasser 300 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    coverImage: {
        type: String,
        required: [true, 'L\'image de couverture est obligatoire']
    },
    fileUrl: {
        type: String,
        required: [true, 'Le PDF est obligatoire']
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Le slug est généré dans le contrôleur, pas besoin de hook pre('save')

const Archive = mongoose.model('Archive', archiveSchema);

export default Archive;