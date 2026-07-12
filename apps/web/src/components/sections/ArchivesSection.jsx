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
                const res = await archiveService.getArchives({ featured: 'true' });
                setArchives(res.data.slice(0, 3));
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

    const getDateParts = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            year: date.getFullYear()
        };
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
        <section data-theme="light" className="py-16 sm:py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50/20">
            <div className="container">
                <SectionTitle 
                    badge="Archives"
                    title="Nos publications"
                    description="Consultez nos derniers rapports et documents officiels."
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm">
                                <div className="h-64 bg-slate-200 animate-pulse" />
                                <div className="p-6">
                                    <div className="w-24 h-4 bg-slate-200 rounded animate-pulse mb-3" />
                                    <div className="w-full h-6 bg-slate-200 rounded animate-pulse mb-3" />
                                    <div className="w-full h-16 bg-slate-200 rounded animate-pulse mb-4" />
                                    <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                            {archives.map((archive, index) => {
                                const dateParts = getDateParts(archive.publishedAt || archive.createdAt);
                                
                                return (
                                    <Link
                                        to={`/archives/${archive.slug}`}
                                        key={archive._id}
                                        className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 hover:border-brand-blue/30 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block"
                                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                                    >
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={archive.coverImage 
                                                    ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`)
                                                    : '/placeholder.jpg'}
                                                alt={archive.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                            <div className="absolute top-4 right-4 flex flex-col items-center justify-center w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm">
                                                <span className="text-2xl font-bold text-brand-blue leading-none">{dateParts.day}</span>
                                                <span className="text-xs text-gray-600 uppercase mt-1">{dateParts.month}</span>
                                            </div>

                                            <div className="absolute bottom-4 right-4 w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg">
                                                <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(archive.publishedAt || archive.createdAt)}</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-heading text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-blue transition-colors duration-300">
                                                {archive.title}
                                            </h3>

                                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                                {archive.excerpt}
                                            </p>

                                            <div className="flex gap-2">
                                                <div className="inline-flex items-center gap-2 text-brand-blue font-medium text-sm group/link">
                                                    <span>Voir le détail</span>
                                                    <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDownload(e, archive.fileUrl, `${archive.title}.pdf`)}
                                                    className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-blue text-sm transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="text-center mt-12">
                            <Link 
                                to="/archives"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl"
                            >
                                <span>Voir toutes les archives</span>
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