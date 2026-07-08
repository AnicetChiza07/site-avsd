// ===========================================
// PAGE GESTION DES CATÉGORIES
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, 
    Edit3, 
    Trash2, 
    X, 
    Loader2, 
    Tag,
    AlertTriangle
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import categoryService from '../services/categoryService';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // État du modal (créer/modifier)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    
    // État du modal de suppression
    const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

    // Charger les catégories au démarrage
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getCategories();
                setCategories(response.data);
            } catch (error) {
                console.error('Erreur:', error);
                toast.error('Impossible de charger les catégories');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Ouvrir le modal pour créer
    const openCreateModal = () => {
        setEditingCategory(null);
        setName('');
        setIsModalOpen(true);
    };

    // Ouvrir le modal pour modifier
    const openEditModal = (category) => {
        setEditingCategory(category);
        setName(category.name);
        setIsModalOpen(true);
    };

    // Fermer le modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setName('');
    };

    // Sauvegarder (créer ou modifier)
    const handleSave = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Le nom de la catégorie est obligatoire');
            return;
        }

        setSaving(true);

        try {
            if (editingCategory) {
                // Modification
                await categoryService.updateCategory(editingCategory._id, { name: name.trim() });
                toast.success('Catégorie modifiée avec succès');
            } else {
                // Création
                await categoryService.createCategory({ name: name.trim() });
                toast.success('Catégorie créée avec succès');
            }

            // Recharger la liste
            const response = await categoryService.getCategories();
            setCategories(response.data);

            closeModal();

        } catch (error) {
            console.error('Erreur:', error);
            const message = error.response?.data?.message || 'Erreur lors de la sauvegarde';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Confirmer la suppression
    const handleDelete = async () => {
        if (!deleteModal.category) return;

        try {
            await categoryService.deleteCategory(deleteModal.category._id);
            toast.success('Catégorie supprimée');

            // Retirer de la liste locale
            setCategories(categories.filter(c => c._id !== deleteModal.category._id));
            setDeleteModal({ open: false, category: null });

        } catch (error) {
            console.error('Erreur:', error);
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(message);
        }
    };

    // Loading
    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
                    <p className="text-gray-600 mt-1">
                        {categories.length} catégorie{categories.length > 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle catégorie
                </button>
            </div>

            {/* Liste des catégories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {categories.length === 0 ? (
                    <div className="text-center py-16">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Aucune catégorie
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Commencez par créer votre première catégorie
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Créer une catégorie
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Nom
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Créé le
                                </th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-brand-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                                                <Tag className="w-4 h-4 text-brand-blue" />
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {category.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            {category.slug}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, category })}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* =========================================== */}
            {/* MODAL CRÉER / MODIFIER                      */}
            {/* =========================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
                        {/* En-tête du modal */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSave}>
                            <div className="mb-6">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la catégorie
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                    placeholder="Ex: Technologie, Santé, Éducation..."
                                    required
                                    autoFocus
                                    disabled={saving}
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Le slug sera généré automatiquement à partir du nom
                                </p>
                            </div>

                            {/* Boutons */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                                    disabled={saving}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue hover:bg-blue-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        editingCategory ? 'Modifier' : 'Créer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================== */}
            {/* MODAL CONFIRMATION SUPPRESSION              */}
            {/* =========================================== */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ open: false, category: null })}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
                        <div className="text-center">
                            {/* Icône warning */}
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Supprimer cette catégorie ?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                La catégorie <strong>"{deleteModal.category?.name}"</strong> sera définitivement supprimée.
                            </p>
                            
                            {/* Boutons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setDeleteModal({ open: false, category: null })}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
};

export default Categories;