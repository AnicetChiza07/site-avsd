// ===========================================
// PAGE GESTION DES ZONES D'INTERVENTION
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, 
    AlertTriangle, Map, Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import zoneService from '../services/zoneService';

const Zones = () => {
    // États principaux
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États des modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, zone: null });
    
    // États du formulaire
    const [editingZone, setEditingZone] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        order: '0'
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        // Fonction définie à l'intérieur pour éviter le warning ESLint
        const fetchZones = async () => {
            try {
                setLoading(true);
                const res = await zoneService.getZones();
                setZones(res.data);
            } catch {
                toast.error('Impossible de charger les zones');
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, []);

    // ===========================================
    // GESTION DU FORMULAIRE
    // ===========================================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast.error('L\'image ne doit pas dépasser 4 Mo');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const openCreateModal = () => {
        // NOUVEAU : Vérification de la limite de 10 zones
        if (zones.length >= 10) {
            toast.warning('Le nombre maximum de 10 zones d\'intervention a été atteint. Veuillez supprimer une zone existante avant d\'en ajouter une nouvelle.');
            return;
        }
        
        setEditingZone(null);
        setFormData({ title: '', description: '', order: '0' });
        setImageFile(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (zone) => {
        setEditingZone(zone);
        setFormData({
            title: zone.title,
            description: zone.description,
            order: zone.order.toString()
        });
        setImageFile(null);
        setImagePreview(`http://localhost:5000${zone.image}`);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingZone(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.title.trim() || !formData.description.trim()) {
            toast.error('Veuillez remplir le titre et la description');
            return;
        }
        if (!editingZone && !imageFile) {
            toast.error('L\'image est obligatoire');
            return;
        }

        setSaving(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('description', formData.description.trim());
            data.append('order', formData.order);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingZone) {
                await zoneService.updateZone(editingZone._id, data);
                toast.success('Zone modifiée avec succès');
            } else {
                await zoneService.createZone(data);
                toast.success('Zone créée avec succès');
            }
            
            // Recharger la liste
            const res = await zoneService.getZones();
            setZones(res.data);
            closeModal();
        } catch (err) {
            console.error('Erreur:', err);
            // NOUVEAU : Gestion spécifique de l'erreur de limite venant du backend
            if (err.response?.status === 400 && err.response?.data?.message?.includes('maximum de 10')) {
                toast.warning(err.response.data.message);
            } else {
                const message = err.response?.data?.message || 'Erreur lors de la sauvegarde';
                toast.error(message);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.zone) return;
        try {
            await zoneService.deleteZone(deleteModal.zone._id);
            toast.success('Zone supprimée');
            setZones(zones.filter(z => z._id !== deleteModal.zone._id));
            setDeleteModal({ open: false, zone: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    // ===========================================
    // RENDU
    // ===========================================
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Zones d'intervention</h1>
                    <p className="text-gray-600 mt-2">
                        {zones.length} zone{zones.length > 1 ? 's' : ''} enregistrée{zones.length > 1 ? 's' : ''} sur 10 maximum
                    </p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    disabled={zones.length >= 10}
                    className={`flex items-center gap-2 font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                        zones.length >= 10 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:shadow-lg' 
                        : 'bg-brand-blue hover:bg-blue-800 text-white'
                    }`}
                >
                    <Plus className="w-5 h-5" /> Nouvelle zone
                </button>
            </div>

            {/* NOUVEAU : Alerte si limite atteinte */}
            {zones.length >= 10 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-yellow-800">Limite atteinte</h3>
                        <p className="text-xs text-yellow-700 mt-1">Vous avez atteint le nombre maximum de 10 zones. Supprimez une zone existante pour en ajouter une nouvelle.</p>
                    </div>
                </div>
            )}

            {/* Liste des zones */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {zones.length === 0 ? (
                    <div className="text-center py-20">
                        <Map className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Aucune zone</h3>
                        <p className="text-gray-500 mb-6">Commencez par ajouter une zone d'intervention</p>
                        <button 
                            onClick={openCreateModal} 
                            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all"
                        >
                            <Plus className="w-5 h-5" /> Créer une zone
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {zones.map((zone) => (
                            <div 
                                key={zone._id} 
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img 
                                        src={`http://localhost:5000${zone.image}`} 
                                        alt={zone.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg truncate">
                                            {zone.title}
                                        </h3>
                                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium whitespace-nowrap ml-2">
                                            Ordre: {zone.order}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                        {zone.description}
                                    </p>
                                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                        <button 
                                            onClick={() => openEditModal(zone)} 
                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModal({ open: true, zone })} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* =========================================== */}
            {/* MODAL FORMULAIRE                            */}
            {/* =========================================== */}
            {isModalOpen && (
                <>
                    {/* Overlay avec blur */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={closeModal} 
                    />
                    
                    {/* Conteneur du modal */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header du modal */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingZone ? 'Modifier la zone' : 'Nouvelle zone'}
                                </h2>
                                <button 
                                    onClick={closeModal} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Contenu du modal */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Titre */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titre <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.title} 
                                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                        placeholder="Ex: Goma"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea 
                                        value={formData.description} 
                                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                        rows="3" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
                                        placeholder="Brève description de la zone..."
                                        required
                                    />
                                </div>

                                {/* Ordre et Image */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Ordre */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ordre d'affichage
                                        </label>
                                        <input 
                                            type="number" 
                                            value={formData.order} 
                                            onChange={(e) => setFormData({...formData, order: e.target.value})} 
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                                            min="0"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            0 = premier, 1 = deuxième, etc.
                                        </p>
                                    </div>

                                    {/* Image */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Image <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-blue transition-colors group cursor-pointer h-[110px] flex items-center justify-center overflow-hidden">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleImageChange} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {imagePreview ? (
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="h-full w-full object-cover rounded-lg absolute inset-0" 
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                                    <p className="text-xs text-gray-500">Cliquez pour ajouter</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Boutons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={closeModal} 
                                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                {editingZone ? 'Modifier' : 'Créer'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* =========================================== */}
            {/* MODAL SUPPRESSION                           */}
            {/* =========================================== */}
            {deleteModal.open && (
                <>
                    {/* Overlay avec blur */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, zone: null })} 
                    />
                    
                    {/* Modal */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                                Supprimer cette zone ?
                            </h3>
                            <p className="text-gray-600 text-center mb-8">
                                La zone <strong>"{deleteModal.zone?.title}"</strong> sera définitivement supprimée.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ open: false, zone: null })} 
                                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default Zones;