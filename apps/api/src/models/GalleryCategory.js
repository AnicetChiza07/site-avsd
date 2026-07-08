import mongoose from 'mongoose';

const galleryCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom de la catégorie est obligatoire'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// SUPPRIMÉ : Le hook pre('save') qui causait l'erreur

const GalleryCategory = mongoose.model('GalleryCategory', galleryCategorySchema);
export default GalleryCategory;