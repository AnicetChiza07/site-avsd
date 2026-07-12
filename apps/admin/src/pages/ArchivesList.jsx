import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import archiveService from '../services/archiveService';
import { getImageUrl } from '../services/api';

const ArchivesList = () => {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('all');
    const [years, setYears] = useState([]);

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                setLoading(true);
                const params = selectedYear !== 'all' ? { year: selectedYear } : {};
                const res = await archiveService.getArchives(params);
                setArchives(res.data);
                
                // Extraire les années uniques
                const yearsSet = new Set();
                res.data.forEach(archive => {
                    const year = new Date(archive.publishedAt).getFullYear();
                    yearsSet.add(year);
                });
                setYears(Array.from(yearsSet).sort((a, b) => b - a));
            } catch (error) {
                console.error('Erreur chargement archives:', error);
                toast.error('Erreur lors du chargement des archives');
            } finally {
                setLoading(false);
            }
        };

        fetchArchives();
    }, [selectedYear]);

    const fetchArchives = async () => {
        try {
            setLoading(true);
            const params = selectedYear !== 'all' ? { year: selectedYear } : {};
            const res = await archiveService.getArchives(params);
            setArchives(res.data);
            
            // Extraire les années uniques
            const yearsSet = new Set();
            res.data.forEach(archive => {
                const year = new Date(archive.publishedAt).getFullYear();
                yearsSet.add(year);
            });
            setYears(Array.from(yearsSet).sort((a, b) => b - a));
        } catch (error) {
            console.error('Erreur chargement archives:', error);
            toast.error('Erreur lors du chargement des archives');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
            return;
        }

        try {
            await archiveService.deleteArchive(id);
            toast.success('Archive supprimée avec succès');
            fetchArchives();
        } catch (error) {
            console.error('Erreur suppression:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Archives</h1>
                    <p className="text-gray-600">Gérez les rapports et documents de l'organisation</p>
                </div>
                <Link
                    to="/archives/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-colors shadow-lg shadow-brand-blue/30"
                >
                    <Plus className="w-5 h-5" />
                    Nouvelle archive
                </Link>
            </div>

            {/* Filtres */}
            {years.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                    <button
                        onClick={() => setSelectedYear('all')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                            selectedYear === 'all'
                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                        }`}
                    >
                        Toutes les années
                    </button>
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year.toString())}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                selectedYear === year.toString()
                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                            }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}

            {/* Liste des archives */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200" />
                            <div className="p-6 space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : archives.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-6">Aucune archive trouvée</p>
                    <Link
                        to="/archives/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Créer la première archive
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archives.map((archive) => (
                        <div
                            key={archive._id}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Image de couverture */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={getImageUrl(archive.coverImage)}
                                    alt={archive.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                
                                {/* Badge featured */}
                                {archive.featured && (
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-brand-gold text-gray-900 text-xs font-bold rounded-full">
                                        À la une
                                    </div>
                                )}
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-blue transition-colors">
                                    {archive.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {archive.excerpt}
                                </p>
                                
                                {/* Date */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(archive.publishedAt)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/archives/edit/${archive._id}`}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(archive._id, archive.title)}
                                        className="inline-flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
    );
};

export default ArchivesList;