// ===========================================
// MIDDLEWARE D'UPLOAD DE FICHIERS
// ===========================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ===========================================
// CONFIGURATIONS DE STOCKAGE
// ===========================================

// Pour les articles (image de couverture)
const articleCoverStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/articles/covers';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `cover-${uniqueSuffix}${ext}`);
    }
});

// Pour le contenu des articles (images dans le texte)
const articleContentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/articles/content';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `content-${uniqueSuffix}${ext}`);
    }
});

// Pour les opportunités (PDF)
const opportunityStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/opportunities';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `opp-${uniqueSuffix}${ext}`);
    }
});

// Pour les zones d'intervention
const zoneStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/zones';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `zone-${uniqueSuffix}${ext}`);
    }
});

// Pour les partenaires (logos)
const partnerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/partners';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `partner-${uniqueSuffix}${ext}`);
    }
});

// NOUVEAU : Pour la galerie d'images
const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/gallery';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
    }
});

// Middleware générique (fallback)
const genericStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `file-${uniqueSuffix}${ext}`);
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

// ===========================================
// INSTANCES DE MULTER
// ===========================================

const uploadArticleCover = multer({
    storage: articleCoverStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});

const uploadArticleContent = multer({
    storage: articleContentStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});

const uploadOpportunity = multer({
    storage: opportunityStorage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 Mo pour PDF
});

const uploadZone = multer({
    storage: zoneStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
});

const uploadPartner = multer({
    storage: partnerStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 Mo pour logos
});

// NOUVEAU : Instance pour la galerie
const uploadGallery = multer({
    storage: galleryStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo pour images
});

const upload = multer({
    storage: genericStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo
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

// Configuration pour les avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/avatars';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${ext}`);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 Mo
});

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
    uploadGallery,  // NOUVEAU : Export de uploadGallery
    uploadAvatar,
    handleUploadError 
};