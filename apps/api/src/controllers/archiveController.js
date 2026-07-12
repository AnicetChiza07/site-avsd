import Archive from '../models/Archive.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Obtenir toutes les archives
// @route   GET /api/archives
// @access  Public
export const getArchives = async (req, res) => {
    try {
        const { year, featured } = req.query;
        
        let filter = {};
        
        // Filtre par année
        if (year && year !== 'all') {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            filter.publishedAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        
        // Filtre par featured
        if (featured === 'true') {
            filter.featured = true;
        }
        
        const archives = await Archive.find(filter)
            .sort({ publishedAt: -1, createdAt: -1 });
        
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
        console.log('📦 Body:', req.body);
        console.log('📎 Files:', req.files);
        
        const { title, excerpt, description } = req.body;
        
        // Vérifier que les fichiers sont uploadés
        if (!req.files || !req.files.coverImage || !req.files.pdf) {
            console.error('❌ Fichiers manquants:', req.files);
            return res.status(400).json({ 
                message: 'L\'image de couverture et le PDF sont obligatoires' 
            });
        }
        
        console.log('🖼️ Upload image...');
        // Upload image de couverture sur Cloudinary
        const coverImageResult = await cloudinary.uploader.upload(
            req.files.coverImage[0].path,
            {
                folder: 'avsd-rdc/archives/covers',
                transformation: [
                    { width: 1200, height: 630, crop: 'limit' },
                    { quality: 'auto' },
                    { format: 'auto' }
                ]
            }
        );
        console.log('✅ Image uploadée:', coverImageResult.secure_url);
        
        console.log('📄 Upload PDF...');
        // Upload PDF sur Cloudinary
        const pdfResult = await cloudinary.uploader.upload(
            req.files.pdf[0].path,
            {
                folder: 'avsd-rdc/archives/pdfs',
                resource_type: 'raw',
                format: 'pdf'
            }
        );
        console.log('✅ PDF uploadé:', pdfResult.secure_url);
        
        // Générer le slug à partir du titre
        const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        
        console.log('💾 Sauvegarde en base...');
        // Créer l'archive
        const archive = await Archive.create({
            title,
            slug,
            excerpt,
            description,
            coverImage: coverImageResult.secure_url,
            fileUrl: pdfResult.secure_url
        });
        
        console.log('✅ Archive créée:', archive._id);
        
        // Nettoyer les fichiers temporaires
        try {
            if (req.files.coverImage[0].path) {
                fs.unlinkSync(req.files.coverImage[0].path);
            }
            if (req.files.pdf[0].path) {
                fs.unlinkSync(req.files.pdf[0].path);
            }
        } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage fichiers temporaires:', cleanupError.message);
        }
        
        res.status(201).json(archive);
    } catch (error) {
        console.error('❌ ERREUR createArchive:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            message: 'Erreur serveur',
            error: error.message 
        });
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
        
        // Mettre à jour les champs texte
        if (title) {
            archive.title = title;
            // Régénérer le slug si le titre change
            archive.slug = title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
        if (excerpt) archive.excerpt = excerpt;
        if (description) archive.description = description;
        if (featured !== undefined) archive.featured = featured;
        
        // Upload nouvelle image si fournie
        if (req.files?.coverImage) {
            // Supprimer l'ancienne image de Cloudinary
            if (archive.coverImage) {
                const publicId = archive.coverImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`avsd-rdc/archives/covers/${publicId}`);
            }
            
            const coverImageResult = await cloudinary.uploader.upload(
                req.files.coverImage[0].path,
                {
                    folder: 'avsd-rdc/archives/covers',
                    transformation: [
                        { width: 1200, height: 630, crop: 'limit' },
                        { quality: 'auto' },
                        { format: 'auto' }
                    ]
                }
            );
            archive.coverImage = coverImageResult.secure_url;
            
            // Nettoyer fichier temporaire
            try {
                fs.unlinkSync(req.files.coverImage[0].path);
            } catch (e) {
                console.warn('⚠️ Erreur nettoyage image:', e.message);
            }
        }
        
        // Upload nouveau PDF si fourni
        if (req.files?.pdf) {
            // Supprimer l'ancien PDF de Cloudinary
            if (archive.fileUrl) {
                const publicId = archive.fileUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`avsd-rdc/archives/pdfs/${publicId}`, {
                    resource_type: 'raw'
                });
            }
            
            const pdfResult = await cloudinary.uploader.upload(
                req.files.pdf[0].path,
                {
                    folder: 'avsd-rdc/archives/pdfs',
                    resource_type: 'raw',
                    format: 'pdf'
                }
            );
            archive.fileUrl = pdfResult.secure_url;
            
            // Nettoyer fichier temporaire
            try {
                fs.unlinkSync(req.files.pdf[0].path);
            } catch (e) {
                console.warn('⚠️ Erreur nettoyage PDF:', e.message);
            }
        }
        
        await archive.save();
        
        res.json(archive);
    } catch (error) {
        console.error('❌ Erreur updateArchive:', error.message);
        console.error('Stack:', error.stack);
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
        
        // Supprimer l'image de Cloudinary
        if (archive.coverImage) {
            const publicId = archive.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`avsd-rdc/archives/covers/${publicId}`);
        }
        
        // Supprimer le PDF de Cloudinary
        if (archive.fileUrl) {
            const publicId = archive.fileUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`avsd-rdc/archives/pdfs/${publicId}`, {
                resource_type: 'raw'
            });
        }
        
        await archive.deleteOne();
        
        res.json({ message: 'Archive supprimée avec succès' });
    } catch (error) {
        console.error('❌ Erreur deleteArchive:', error.message);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};