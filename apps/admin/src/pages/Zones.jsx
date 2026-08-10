import { useState, useEffect } from 'react';
import { MapPin, Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout'; // ✅ Réintégré pour le Header et la Sidebar
import api, { getImageUrl } from '../services/api';

const Zones = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chargement des données (Pattern robuste sans warning ESLint)
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const response = await api.get('/zones'); // Vérifie que l'endpoint est correct
                if (isMounted) {
                    setZones(response.data.data || response.data || []);
                    setError('');
                }
            } catch (err) {
                console.error('Erreur lors du chargement des zones:', err);
                if (isMounted) {
                    setError('Impossible de charger les zones. Veuillez réessayer.');
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

    // Fonction pour supprimer une zone
    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
        
        try {
            await api.delete(`/zones/${id}`);
            setZones(prevZones => prevZones.filter(zone => zone._id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            alert('Erreur lors de la suppression.');
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
        <AdminLayout> {/* ✅ Le Layout englobe tout pour afficher le Header et la Sidebar */}
            <div className="p-6 max-w-7xl mx-auto">
                {/* En-tête de la page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-brand-blue" />
                            Zones d'intervention
                        </h1>
                        <p className="text-gray-500 mt-1">Gérez les zones géographiques où l'AVSD intervient.</p>
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Ajouter une zone
                    </button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Grille des zones */}
                {zones.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucune zone trouvée.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {zones.map((zone) => (
                            <div key={zone._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                
                                {/* Zone d'image */}
                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                    {/* ✅ CORRECTION : getImageUrl + gestion d'erreur */}
                                    {zone.image ? ( 
                                        <img 
                                            src={getImageUrl(zone.image)} 
                                            alt={zone.name || 'Zone'}
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
                                    
                                    {/* ✅ SUPPRIMÉ : Le badge "Active / Inactive" a été retiré d'ici */}
                                </div>

                                {/* Contenu de la carte */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                                        {zone.name || 'Nom de la zone'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {zone.description || 'Aucune description disponible.'}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <Edit className="w-4 h-4" />
                                            Modifier
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(zone._id)}
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
        </AdminLayout>
    );
};

export default Zones;