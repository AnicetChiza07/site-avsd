import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
    icon: { type: String, required: true },
    value: { type: Number, required: true },
    suffix: { type: String, default: '+' },
    label: { type: String, required: true },
    description: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model('Stat', statSchema);