import mongoose from 'mongoose';

const milieuSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Le type est obligatoire'],
        enum: ['province', 'ville'],
        default: 'province'
    },
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true
    },
    province: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// IMPORTANT : Index unique COMPOSÉ (type + name)
// Cela permet d'avoir "Goma" comme ville ET "Goma" comme province
// Mais pas deux "Goma" dans le même type
milieuSchema.index({ type: 1, name: 1 }, { unique: true });

export default mongoose.model('MilieuIntervention', milieuSchema);