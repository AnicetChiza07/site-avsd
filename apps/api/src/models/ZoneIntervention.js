import mongoose from 'mongoose';

const zoneInterventionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'L\'image est obligatoire']
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const ZoneIntervention = mongoose.model('ZoneIntervention', zoneInterventionSchema);

export default ZoneIntervention;