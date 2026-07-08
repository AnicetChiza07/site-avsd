import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'L\'image est obligatoire']
    },
    title: {
        type: String,
        required: [true, 'Le titre de l\'image est obligatoire'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GalleryCategory',
        required: [true, 'La catégorie est obligatoire']
    }
}, {
    timestamps: true
});

const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;