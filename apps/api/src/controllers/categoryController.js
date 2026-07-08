import Category from '../models/Category.js';

// ===========================================
// @desc    Récupérer toutes les catégories
// @route   GET /api/categories
// @access  Public
// ===========================================
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Erreur getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Créer une nouvelle catégorie
// @route   POST /api/categories
// @access  Privé (Admin)
// ===========================================
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Le nom de la catégorie est obligatoire'
            });
        }

    // Générer le slug automatiquement
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

        // Vérifier si la catégorie existe déjà
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Cette catégorie existe déjà'
            });
        }

        const category = await Category.create({ name, slug });

        res.status(201).json({
            success: true,
            message: 'Catégorie créée avec succès',
            data: category
        });

    } catch (error) {
        console.error('Erreur createCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Modifier une catégorie
// @route   PUT /api/categories/:id
// @access  Privé (Admin)
// ===========================================
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Catégorie non trouvée'
        });
        }

        // Si le nom a changé, régénérer le slug
        if (name && name !== category.name) {
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
        
        // Vérifier que le nouveau slug n'existe pas
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Une catégorie avec ce nom existe déjà'
            });
        }
        
        category.slug = slug;
        }

        category.name = name || category.name;
        await category.save();

        res.status(200).json({
            success: true,
            message: 'Catégorie mise à jour',
            data: category
        });

    } catch (error) {
        console.error('Erreur updateCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// ===========================================
// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
// @access  Privé (Admin)
// ===========================================
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Catégorie non trouvée'
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Catégorie supprimée'
        });

    } catch (error) {
        console.error('Erreur deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

export { getCategories, createCategory, updateCategory, deleteCategory };