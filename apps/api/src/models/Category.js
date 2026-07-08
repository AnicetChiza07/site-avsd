import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom de la catégorie est obligatoire'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Category', categorySchema);