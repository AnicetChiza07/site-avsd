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

// Générer le slug automatiquement avant la sauvegarde
archiveSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

const Archive = mongoose.model('Archive', archiveSchema);

export default Archive;