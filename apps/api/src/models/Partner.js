// ===========================================
// MODÈLE PARTENAIRE
// ===========================================

import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'L\'image est obligatoire']
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Partner', partnerSchema);