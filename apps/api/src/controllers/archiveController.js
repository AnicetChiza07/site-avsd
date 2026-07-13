import Archive from '../models/Archive.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Fonction helper pour générer les initiales à partir d'un nom
const generateInitials = (name) => {
    if (!name) return 'AVSD';
    
    // Séparer le nom en parties (ex: "Anicet Chiza" -> ["Anicet", "Chiza"])
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
        // Un seul mot : prendre les 2 premières lettres
        return parts[0].substring(0, 2).toUpperCase();
    }
    
    // Plusieurs mots : prendre la première lettre des 2 premiers mots
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

// @desc    Obtenir toutes les archives
// @route   GET /api/archives
// @access  Public
export const getArchives = async (req, res) => {
    try {
        const { year, featured } = req.query;
        
        let filter = {};
        
        if (year && year !== 'all') {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            filter.publishedAt = { $gte: startDate, $lte: endDate };
        }
        
        if (featured === 'true') {
            filter.featured = true;
        }
        
        const archives = await Archive.find(filter).sort({ publishedAt: -1, createdAt: -1 });
        res.json(archives);
    } catch (error) {
        console.error('❌ Erreur getArchives:', error.message);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Obtenir une archive par slug
// @route   GET /api/archives/:slug
// @access  Public
export const getArchiveBySlug = async (req, res) => {
    try {
        const archive = await Archive.findOne({ slug: req.params.slug });
        if (!archive) {
            return res.status(404).json({ message: 'Archive introuvable' });
        }
        res.json(archive);
    } catch (error) {
        console.error('❌ Erreur getArchiveBySlug:', error.message);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Créer une archive
// @route   POST /api/archives
// @access  Admin
export const createArchive = async (req, res) => {
    try {
        console.log('📥 Début création archive');
        
        const { title, excerpt, description, featured } = req.body;
        
        if (!req.files || !req.files.coverImage || !req.files.pdf) {
            console.error('❌ Fichiers manquants:', req.files);
            return res.status(400).json({ message: 'L\'image de couverture et le PDF sont obligatoires' });
        }
        
        if (featured === 'true' || featured === true) {
            await Archive.updateMany({}, { $set: { featured: false } });
            console.log('✅ Autres archives décochées');
        }
        
        // ✅ CORRECTION ICI : On utilise req.admin (défini par le middleware d'auth)
        const authorName = req.admin ? req.admin.name : 'AVSD RDC';
        const authorInitials = generateInitials(authorName);
        console.log('👤 Auteur détecté:', authorName, '| Initiales:', authorInitials);
        
        console.log('🖼️ Upload image...');
        const coverImageResult = await cloudinary.uploader.upload(
            req.files.coverImage[0].path,
            {
                folder: 'avsd-rdc/archives/covers',
                transformation: [{ width: 1200, height: 630, crop: 'limit' }, { quality: 'auto' }, { format: 'auto' }]
            }
        );
        
        console.log('📄 Upload PDF...');
        const pdfResult = await cloudinary.uploader.upload(
            req.files.pdf[0].path,
            { folder: 'avsd-rdc/archives/pdfs', resource_type: 'raw', format: 'pdf' }
        );
        
        const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        
        console.log('💾 Sauvegarde en base...');
        const archive = await Archive.create({
            title,
            slug,
            excerpt,
            description,
            coverImage: coverImageResult.secure_url,
            fileUrl: pdfResult.secure_url,
            featured: featured === 'true' || featured === true,
            author: {
                name: authorName,
                initials: authorInitials
            }
        });
        
        console.log('✅ Archive créée:', archive._id);
        
        try {
            if (req.files.coverImage[0].path) fs.unlinkSync(req.files.coverImage[0].path);
            if (req.files.pdf[0].path) fs.unlinkSync(req.files.pdf[0].path);
        } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage fichiers temporaires:', cleanupError.message);
        }
        
        res.status(201).json(archive);
    } catch (error) {
        console.error('❌ ERREUR createArchive:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Modifier une archive
// @route   PUT /api/archives/:id
// @access  Admin
export const updateArchive = async (req, res) => {
    try {
        const archive = await Archive.findById(req.params.id);
        if (!archive) {
            return res.status(404).json({ message: 'Archive introuvable' });
        }
        
        const { title, excerpt, description, featured } = req.body;
        
        if (featured === 'true' || featured === true) {
            await Archive.updateMany({ _id: { $ne: req.params.id } }, { $set: { featured: false } });
            console.log('✅ Autres archives décochées');
        }
        
        if (title) {
            archive.title = title;
            archive.slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        if (excerpt) archive.excerpt = excerpt;
        if (description) archive.description = description;
        if (featured !== undefined) archive.featured = featured === 'true' || featured === true;
        
        if (req.files?.coverImage) {
            if (archive.coverImage) {
                const publicId = archive.coverImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`avsd-rdc/archives/covers/${publicId}`);
            }
            const coverImageResult = await cloudinary.uploader.upload(req.files.coverImage[0].path, {
                folder: 'avsd-rdc/archives/covers',
                transformation: [{ width: 1200, height: 630, crop: 'limit' }, { quality: 'auto' }, { format: 'auto' }]
            });
            archive.coverImage = coverImageResult.secure_url;
            try { fs.unlinkSync(req.files.coverImage[0].path); } catch (e) { console.warn('⚠️ Erreur nettoyage image:', e.message); }
        }
        
        if (req.files?.pdf) {
            if (archive.fileUrl) {
                const publicId = archive.fileUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`avsd-rdc/archives/pdfs/${publicId}`, { resource_type: 'raw' });
            }
            const pdfResult = await cloudinary.uploader.upload(req.files.pdf[0].path, {
                folder: 'avsd-rdc/archives/pdfs', resource_type: 'raw', format: 'pdf'
            });
            archive.fileUrl = pdfResult.secure_url;
            try { fs.unlinkSync(req.files.pdf[0].path); } catch (e) { console.warn('⚠️ Erreur nettoyage PDF:', e.message); }
        }
        
        await archive.save();
        res.json(archive);
    } catch (error) {
        console.error('❌ Erreur updateArchive:', error.message);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// @desc    Supprimer une archive
// @route   DELETE /api/archives/:id
// @access  Admin
export const deleteArchive = async (req, res) => {
    try {
        const archive = await Archive.findById(req.params.id);
        if (!archive) {
            return res.status(404).json({ message: 'Archive introuvable' });
        }
        
        if (archive.coverImage) {
            const publicId = archive.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`avsd-rdc/archives/covers/${publicId}`);
        }
        if (archive.fileUrl) {
            const publicId = archive.fileUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`avsd-rdc/archives/pdfs/${publicId}`, { resource_type: 'raw' });
        }
        
        await archive.deleteOne();
        res.json({ message: 'Archive supprimée avec succès' });
    } catch (error) {
        console.error('Erreur deleteArchive:', error.message);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};