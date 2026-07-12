import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, Download } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import archiveService from '../../services/archiveService';
import { getBaseUrl } from '../../services/api';

const ArchivesSection = () => {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                const res = await archiveService.getArchives();
                const archivesData = Array.isArray(res) ? res : (res.data || []);
                setArchives(archivesData.slice(0, 3));
            } catch (error) {
                console.error('Erreur chargement archives:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArchives();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDownload = async (e, fileUrl, fileName) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${getBaseUrl()}${fileUrl}`;
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Erreur lors du téléchargement');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            window.open(fullUrl, '_blank');
        }
    };

    if (!loading && archives.length === 0) {
        return null;
    }

    return (
        <section data-theme="light" className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
            <div className="container">
                <SectionTitle 
                    badge="Documents"
                    title="Nos publications"
                    description="Consultez nos rapports, documents officiels et publications."
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="relative h-96 bg-slate-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                            {archives.map((archive, index) => {
                                return (
                                    <Link
                                        to={`/archives/${archive.slug}`}
                                        key={archive._id}
                                        className="group relative h-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                                    >
                                        {/* Image de couverture en background */}
                                        <img
                                            src={archive.coverImage 
                                                ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`)
                                                : '/placeholder.jpg'}
                                            alt={archive.title}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

                                        {/* Contenu */}
                                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                            {/* Date en haut */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(archive.publishedAt || archive.createdAt)}</span>
                                                </div>
                                                {archive.featured && (
                                                    <span className="px-3 py-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-lg">
                                                        À la une
                                                    </span>
                                                )}
                                            </div>

                                            {/* Titre et description en bas */}
                                            <div className="space-y-3">
                                                <h3 className="text-xl font-heading text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg">
                                                    {archive.title}
                                                </h3>
                                                <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-md">
                                                    {archive.excerpt}
                                                </p>

                                                {/* Bouton Download en bas à droite */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium group/link">
                                                        <span>Voir le document</span>
                                                        <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    </div>
                                                    <button 
                                                        onClick={(e) => handleDownload(e, archive.fileUrl, `${archive.title}.pdf`)}
                                                        className="w-11 h-11 flex items-center justify-center bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                                                        title="Télécharger le PDF"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bordure au hover */}
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-blue/50 rounded-2xl transition-colors duration-500 pointer-events-none" />
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="text-center mt-12">
                            <Link 
                                to="/archives"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-blue-900 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 hover:-translate-y-0.5"
                            >
                                <span>Voir toutes les publications</span>
                                <ArrowUpRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default ArchivesSection;