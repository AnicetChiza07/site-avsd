import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Edit, Trash2, Plus, X, Loader2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import api, { getImageUrl } from '../services/api';

const Zones = () => {
    // États principaux
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // États des modales
    const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    // États du formulaire d'édition
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);

    // Chargement des données
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const response = await api.get('/zones');
                if (isMounted) {
                    setZones(response.data.data || response.data || []);
                    setError('');
                }
            } catch (err) {
                console.error('Erreur lors du chargement des images:', err);
                if (isMounted) {
                    setError('Impossible de charger les images. Veuillez réessayer.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Fonction helper pour récupérer le titre d'une image (cherche dans plusieurs champs possibles)
    const getItemTitle = (item) => {
        return item?.name || item?.title || item?.caption || 'sans titre';
    };

    // Gestion de la suppression
    const confirmDelete = async () => {
        if (!deleteModal.item) return;
        
        try {
            await api.delete(`/zones/${deleteModal.item._id}`);
            setZones(prevZones => prevZones.filter(zone => zone._id !== deleteModal.item._id));
            setDeleteModal({ open: false, item: null });
            toast.success('Image supprimée avec succès !');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            const message = err.response?.data?.message || 'Erreur lors de la suppression.';
            toast.error(message);
            setDeleteModal({ open: false, item: null });
        }
    };

    // Ouverture de la modale de modification
    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({ 
            name: item.name || item.title || item.caption || '', 
            description: item.description || '' 
        });
        setImageFile(null);
        setImagePreview(item.image ? getImageUrl(item.image) : null);
        setIsEditModalOpen(true);
    };

    // Gestion du changement d'image dans le formulaire
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 5 Mo');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Gestion de la soumission du formulaire de modification
    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const data = new FormData();
            
            // On envoie les deux au cas où le backend attend 'title' ou 'name'
            data.append('name', formData.name);
            data.append('title', formData.name); 
            data.append('description', formData.description);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            // Pas de header manuel : Axios détecte automatiquement le FormData
            const response = await api.put(`/zones/${editingItem._id}`, data);
            
            console.log('Réponse du backend après modification:', response.data);

            // Rechargement de la liste pour avoir les données à jour
            const res = await api.get('/zones');
            setZones(res.data.data || res.data || []);
            
            // Fermeture propre de la modale
            setIsEditModalOpen(false);
            setEditingItem(null);
            toast.success('Image modifiée avec succès !');
            
        } catch (err) {
            console.error('Erreur détaillée lors de la modification:', err);
            const message = err.response?.data?.message || 'Erreur lors de la modification.';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // État de chargement
    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* En-tête de la page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-brand-blue" />
                            Nos actions en image
                        </h1>
                        <p className="text-gray-500 mt-1">Gérer les images qui parlent de nos dernières actions.</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Ajouter une image
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Grille des images */}
                {zones.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucune image trouvée.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {zones.map((zone) => (
                            <div key={zone._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                
                                {/* Zone d'image */}
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {zone.image ? ( 
                                        <img 
                                            src={getImageUrl(zone.image)} 
                                            alt={zone.name || zone.title || 'Image'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>

                                {/* Contenu de la carte */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                                        {zone.name || zone.title || zone.caption || 'Titre de l\'image'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {zone.description || 'Aucune description disponible.'}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <button 
                                            onClick={() => openEditModal(zone)}
                                            className="flex-1 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Modifier
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModal({ open: true, item: zone })}
                                            className="inline-flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modale de suppression */}
            {deleteModal.open && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, item: null })} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer cette image ?</h3>
                            <p className="text-gray-600 text-center mb-8">
                                L'image <strong>"{getItemTitle(deleteModal.item)}"</strong> sera définitivement supprimée.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ open: false, item: null })} 
                                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modale de modification */}
            {isEditModalOpen && editingItem && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setIsEditModalOpen(false)} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Modifier l'image</h2>
                                    <p className="text-gray-600 text-xs mt-0.5">Modifiez les informations de "{getItemTitle(editingItem)}"</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-6 space-y-5 overflow-y-auto">
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                    <textarea 
                                        value={formData.description} 
                                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                        rows="3" 
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image (laisser vide pour garder l'actuelle)</label>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                <button 
                                                    type="button"
                                                    onClick={() => { 
                                                        setImageFile(null); 
                                                        setImagePreview(editingItem.image ? getImageUrl(editingItem.image) : null); 
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="py-6">
                                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm font-semibold text-gray-900 mb-1">Changer l'image</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditModalOpen(false)} 
                                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</>
                                        ) : (
                                            <><Edit className="w-5 h-5" /> Modifier</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

        </AdminLayout>
    );
};

export default Zones;