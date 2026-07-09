// ===========================================
// CONTRÔLEUR D'UPLOAD D'IMAGES (AVEC CLOUDINARY)
// ===========================================

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Aucune image fournie'
            });
        }

        // Avec Cloudinary, req.file.path contient l'URL complète
        const imageUrl = req.file.path;

        res.status(200).json({
            success: true,
            url: imageUrl
        });

    } catch (error) {
        console.error('Erreur uploadImage:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'upload'
        });
    }
};

export { uploadImage };