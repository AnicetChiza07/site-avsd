// ===========================================
// MIDDLEWARE D'UPLOAD AVEC CLOUDINARY
// ===========================================

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

// ===========================================
// STOCKAGE LOCAL TEMPORAIRE (pour archives)
// ===========================================
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const tempStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ===========================================
// CONFIGURATIONS DE STOCKAGE CLOUDINARY
// ===========================================

// Pour les articles (image de couverture)
const articleCoverStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/articles/covers',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }]
    }
});

// Pour le contenu des articles (images dans le texte)
const articleContentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/articles/content',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }]
    }
});

// Pour les opportunités (Image de couverture ET PDF) - MODIFIÉ
const opportunityStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Détecte si le fichier est un PDF
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
        
        return {
            folder: 'avsd-rdc/opportunities',
            // Si c'est un PDF, on autorise 'pdf', sinon on autorise les formats image
            allowed_formats: isPdf ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
            // Si c'est un PDF, resource_type est 'raw', sinon c'est 'auto' (pour les images)
            resource_type: isPdf ? 'raw' : 'auto'
        };
    }
});

// Pour les zones d'intervention
const zoneStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/zones',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }]
    }
});

// Pour les partenaires (logos)
const partnerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/partners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 300, crop: 'limit' }]
    }
});

// Pour la galerie d'images
const galleryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/gallery',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }]
    }
});

// Pour les avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avsd-rdc/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'limit' }]
    }
});

// ===========================================
// FILTRE DE FICHIERS
// ===========================================

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non autorisé. Utilisez PNG, JPG, WebP ou PDF.'), false);
    }
};

const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format non autorisé. Utilisez PNG, JPG ou WebP.'), false);
    }
};

// ===========================================
// INSTANCES DE MULTER
// ===========================================

const uploadArticleCover = multer({
    storage: articleCoverStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadArticleContent = multer({
    storage: articleContentStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadOpportunity = multer({
    storage: opportunityStorage,
    fileFilter, // Accepte maintenant à la fois les images et les PDF grâce au filtre global
    limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadZone = multer({
    storage: zoneStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadPartner = multer({
    storage: partnerStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadGallery = multer({
    storage: galleryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

// Pour les archives (stockage local temporaire)
const uploadArchive = multer({
    storage: tempStorage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 Mo
});

const upload = multer({
    storage: articleCoverStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ===========================================
// GESTION DES ERREURS
// ===========================================

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Le fichier est trop volumineux'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Erreur d'upload: ${err.message}`
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// ===========================================
// EXPORTS
// ===========================================

export { 
    upload,
    uploadArticleCover,
    uploadArticleContent,
    uploadOpportunity,
    uploadZone,
    uploadPartner,
    uploadGallery,
    uploadAvatar,
    uploadArchive,
    handleUploadError 
};