// ===========================================
// PAGE GESTION DES MILIEUX D'INTERVENTION
// ===========================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
    Plus, Edit3, Trash2, X, Loader2, 
    AlertTriangle, MapPin, Building2, Globe,
    CheckCircle
} from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import milieuService from '../services/milieuService';

const Milieux = () => {
    // États principaux
    const [milieux, setMilieux] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // États des modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, milieu: null });
    
    // États du formulaire
    const [editingMilieu, setEditingMilieu] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        type: 'province',
        name: '',
        province: ''
    });

    // ===========================================
    // CHARGEMENT INITIAL
    // ===========================================
    useEffect(() => {
        const fetchMilieux = async () => {
            try {
                setLoading(true);
                const res = await milieuService.getMilieux();
                setMilieux(res.data);
            } catch {
                toast.error('Impossible de charger les milieux');
            } finally {
                setLoading(false);
            }
        };

        fetchMilieux();
    }, []);

    // ===========================================
    // GESTION DU FORMULAIRE
    // ===========================================
    const openCreateModal = () => {
        setEditingMilieu(null);
        setFormData({ type: 'province', name: '', province: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (milieu) => {
        setEditingMilieu(milieu);
        setFormData({
            type: milieu.type,
            name: milieu.name,
            province: milieu.province || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMilieu(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Le nom est obligatoire');
            return;
        }
        if (formData.type === 'ville' && !formData.province) {
            toast.error('La province est obligatoire pour une ville');
            return;
        }

        setSaving(true);
        
        try {
            if (editingMilieu) {
                await milieuService.updateMilieu(editingMilieu._id, formData);
                toast.success('Milieu modifié avec succès');
            } else {
                await milieuService.createMilieu(formData);
                toast.success('Milieu créé avec succès');
            }
            
            const res = await milieuService.getMilieux();
            setMilieux(res.data);
            closeModal();
        } catch (err) {
            console.error('Erreur:', err);
            const message = err.response?.data?.message || 'Erreur lors de la sauvegarde';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.milieu) return;
        try {
            await milieuService.deleteMilieu(deleteModal.milieu._id);
            toast.success('Milieu supprimé');
            setMilieux(milieux.filter(m => m._id !== deleteModal.milieu._id));
            setDeleteModal({ open: false, milieu: null });
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    // Séparer provinces et villes
    const provinces = milieux.filter(m => m.type === 'province');
    const villes = milieux.filter(m => m.type === 'ville');

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
                    <h1 className="text-3xl font-bold text-gray-900">Milieux d'intervention</h1>
                    <p className="text-gray-600 mt-2">
                        Gérez les provinces et villes où l'AVSD intervient
                    </p>
                </div>
                <button 
                    onClick={openCreateModal} 
                    className="flex items-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" /> Nouveau milieu
                </button>
            </div>

            {/* Guide visuel */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <strong>Comment ça marche ?</strong>
                    <p className="mt-1">
                        1️⃣ Créez d'abord des <strong>Provinces</strong> (ex: Nord-Kivu, Sud-Kivu)<br/>
                        2️⃣ Ensuite créez des <strong>Villes</strong> en les rattachant à une province (ex: Goma → Nord-Kivu)
                    </p>
                </div>
            </div>

            {/* Contenu en 2 colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Colonne Provinces */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Provinces</h2>
                                <p className="text-sm text-gray-500">{provinces.length} province{provinces.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                    
                    {provinces.length === 0 ? (
                        <div className="text-center py-12">
                            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Aucune province</p>
                            <button 
                                onClick={() => { setFormData({...formData, type: 'province'}); openCreateModal(); }}
                                className="mt-3 text-sm text-brand-blue hover:underline"
                            >
                                + Ajouter une province
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {provinces.map((province) => (
                                <div 
                                    key={province._id} 
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-brand-blue" />
                                        </div>
                                        <span className="font-medium text-gray-900">{province.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openEditModal(province)} 
                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg"
                                            title="Modifier"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModal({ open: true, milieu: province })} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Colonne Villes */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Villes</h2>
                                <p className="text-sm text-gray-500">{villes.length} ville{villes.length > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                    </div>
                    
                    {villes.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Aucune ville</p>
                            {provinces.length > 0 ? (
                                <button 
                                    onClick={() => { setFormData({...formData, type: 'ville'}); openCreateModal(); }}
                                    className="mt-3 text-sm text-brand-blue hover:underline"
                                >
                                    + Ajouter une ville
                                </button>
                            ) : (
                                <p className="mt-2 text-xs text-orange-600">
                                    Créez d'abord des provinces
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                            {villes.map((ville) => (
                                <div 
                                    key={ville._id} 
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-900 block">{ville.name}</span>
                                            <span className="text-xs text-gray-500">{ville.province}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openEditModal(ville)} 
                                            className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg"
                                            title="Modifier"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModal({ open: true, milieu: ville })} 
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================== */}
            {/* MODAL FORMULAIRE                            */}
            {/* =========================================== */}
            {isModalOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={closeModal} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingMilieu ? 'Modifier le milieu' : 'Nouveau milieu'}
                                </h2>
                                <button 
                                    onClick={closeModal} 
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, type: 'province', province: ''})}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                formData.type === 'province'
                                                    ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <Globe className="w-5 h-5" />
                                            Province
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({...formData, type: 'ville'})}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                formData.type === 'ville'
                                                    ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <Building2 className="w-5 h-5" />
                                            Ville
                                        </button>
                                    </div>
                                </div>

                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                        placeholder={formData.type === 'province' ? 'Ex: Nord-Kivu' : 'Ex: Goma'}
                                        required
                                    />
                                </div>

                                {/* Province (uniquement pour les villes) */}
                                {formData.type === 'ville' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Province <span className="text-red-500">*</span>
                                        </label>
                                        <select 
                                            value={formData.province} 
                                            onChange={(e) => setFormData({...formData, province: e.target.value})} 
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue bg-white"
                                            required
                                        >
                                            <option value="">Sélectionner une province</option>
                                            {provinces.map(prov => (
                                                <option key={prov._id} value={prov.name}>{prov.name}</option>
                                            ))}
                                        </select>
                                        {provinces.length === 0 && (
                                            <p className="mt-2 text-xs text-orange-600">
                                                Ajoutez d'abord des provinces
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Boutons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={closeModal} 
                                        className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving} 
                                        className="flex-1 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</>
                                        ) : (
                                            <><Plus className="w-5 h-5" /> {editingMilieu ? 'Modifier' : 'Créer'}</>
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
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
                        onClick={() => setDeleteModal({ open: false, milieu: null })} 
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-3">Supprimer ce milieu ?</h3>
                            <p className="text-gray-600 text-center mb-8">
                                Le milieu <strong>"{deleteModal.milieu?.name}"</strong> sera définitivement supprimé.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ open: false, milieu: null })} 
                                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-xl"
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
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

export default Milieux;