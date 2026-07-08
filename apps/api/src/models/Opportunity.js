import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est obligatoire'],
        trim: true
    },
    position: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: [true, 'La description est obligatoire']
    },
    type: {
        type: String,
        default: 'emploi'
    },
    contractType: {
        type: String,
        default: 'CDI'
    },
    location: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: [true, 'La date de début est obligatoire']
    },
    endDate: {
        type: Date,
        required: [true, 'La date de fin est obligatoire']
    },
    image: {
        type: String,
        required: [true, 'L\'image de couverture est obligatoire']
    },
    fileUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;