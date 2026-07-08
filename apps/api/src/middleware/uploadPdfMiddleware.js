// ===========================================
// MIDDLEWARE D'UPLOAD DE FICHIERS PDF
// ===========================================
// Gère l'upload de PDF avec validation :
// - Taille max : 10 Mo
// - Format autorisé : PDF uniquement
// ===========================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ===========================================
// CONFIGURATION DU STOCKAGE
// ===========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/opportunities';
        
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
  
    filename: (req, file, cb) => {
        // Générer un nom unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `opportunity-${uniqueSuffix}${ext}`;
        
        cb(null, filename);
    }
});

// ===========================================
// FILTRE DE VALIDATION
// ===========================================
const fileFilter = (req, file, cb) => {
    // Seul le PDF est autorisé
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Format non autorisé. Utilisez uniquement des fichiers PDF.'), false);
    }
};

// ===========================================
// CONFIGURATION DE MULTER
// ===========================================
const uploadPdf = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 Mo en bytes
    }
});

// ===========================================
// MIDDLEWARE DE GESTION DES ERREURS
// ===========================================
const handlePdfUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Le fichier PDF ne doit pas dépasser 10 Mo'
        });
        }
        
        return res.status(400).json({
            success: false,
            message: `Erreur d'upload : ${err.message}`
        });
    }
  
    if (err.message === 'Format non autorisé. Utilisez uniquement des fichiers PDF.') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
  
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
  
  next();
};

export { uploadPdf, handlePdfUploadError };