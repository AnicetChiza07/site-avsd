import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import bgImage from '../assets/images/Hero/herobg.jpg';
import archiveService from '../services/archiveService';
import { getBaseUrl } from '../services/api';

// Composant carte archive (défini en dehors pour éviter les re-renders)
const ArchiveCard = ({ archive, index, isFeatured = false, onDownload }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <Link 
            to={`/archives/${archive.slug}`} 
            className={`group relative ${isFeatured ? 'h-[500px]' : 'h-96'} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block`}
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
            <div className={`absolute inset-0 ${isFeatured ? 'p-8 lg:p-12' : 'p-6'} flex flex-col justify-between`}>
                {/* Date en haut */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(archive.publishedAt || archive.createdAt)}</span>
                    </div>
                    {archive.featured && (
                        <span className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-full shadow-lg">
                            À la une
                        </span>
                    )}
                </div>

                {/* Titre et description en bas */}
                <div className="space-y-3">
                    <h3 className={`${isFeatured ? 'text-2xl lg:text-3xl' : 'text-xl'} font-heading text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg`}>
                        {archive.title}
                    </h3>
                    <p className={`text-white/90 ${isFeatured ? 'text-base' : 'text-sm'} leading-relaxed line-clamp-2 drop-shadow-md`}>
                        {archive.excerpt}
                    </p>

                    {/* Actions en bas */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium group/link">
                            <span>Voir le document</span>
                            <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </div>
                        <button 
                            onClick={(e) => onDownload(e, archive.fileUrl, `${archive.title}.pdf`)}
                            className={`${isFeatured ? 'w-12 h-12' : 'w-11 h-11'} flex items-center justify-center bg-brand-blue hover:bg-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}
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
};

const Archives = () => {
    const [archives, setArchives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const archivesPerPage = 12;

    useEffect(() => {
        const fetchArchives = async () => {
            try {
                const res = await archiveService.getArchives();
                const archivesData = Array.isArray(res) ? res : (res.data || []);
                setArchives(archivesData);
            } catch (error) {
                console.error('Erreur chargement archives:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArchives();
    }, []);

    const years = useMemo(() => {
        if (archives.length === 0) return [];
        const yearsSet = new Set();
        archives.forEach(archive => {
            const year = new Date(archive.publishedAt || archive.createdAt).getFullYear();
            yearsSet.add(year);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [archives]);

    const featuredArchive = useMemo(() => archives.find(archive => archive.featured), [archives]);

    const filteredArchives = useMemo(() => {
        let filtered = archives;
        
        if (featuredArchive) {
            filtered = archives.filter(archive => archive._id !== featuredArchive._id);
        }
        
        if (selectedYear !== 'Tous') {
            filtered = filtered.filter(archive => {
                const archiveYear = new Date(archive.publishedAt || archive.createdAt).getFullYear().toString();
                return archiveYear === selectedYear;
            });
        }
        
        return filtered;
    }, [archives, selectedYear, featuredArchive]);

    const totalPages = Math.ceil(filteredArchives.length / archivesPerPage);
    const startIndex = (currentPage - 1) * archivesPerPage;
    const currentArchives = filteredArchives.slice(startIndex, startIndex + archivesPerPage);

    const handleYearChange = (year) => { setSelectedYear(year); setCurrentPage(1); };
    const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

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

    return (
        <PageBanner title="Nos archives" subtitle="Consultez nos rapports, documents et publications." bgImage={bgImage} badge="Archives" badgeIcon={FileText}>
            <SEO 
                title="Nos archives"
                description="Consultez les archives de l'AVSD RDC : rapports, documents officiels, publications et ressources sur nos actions humanitaires en RDC."
                keywords="archives AVSD, rapports RDC, documents officiels, publications, ressources humanitaires"
                url="/archives"
            />
            
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    {/* Article à la une */}
                    {loading ? (
                        <div className="mb-16">
                            <div className="relative h-[500px] bg-slate-200 rounded-2xl animate-pulse" />
                        </div>
                    ) : featuredArchive && (
                        <div className="mb-16">
                            <ArchiveCard archive={featuredArchive} index={0} isFeatured={true} onDownload={handleDownload} />
                        </div>
                    )}

                    {/* Filtres par année */}
                    <SectionTitle 
                        badge="Filtrer par année" 
                        title="Parcourez nos archives" 
                        description="Découvrez nos rapports et publications à travers les années." 
                    />

                    {!loading && years.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-12">
                            <button 
                                onClick={() => handleYearChange('Tous')} 
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                    selectedYear === 'Tous' 
                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                                }`}
                            >
                                Toutes les archives
                            </button>
                            {years.map((year) => (
                                <button 
                                    key={year} 
                                    onClick={() => handleYearChange(year.toString())} 
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

                    {/* Grille d'archives */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="relative h-96 bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : currentArchives.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentArchives.map((archive, index) => (
                                    <ArchiveCard key={archive._id} archive={archive} index={index} onDownload={handleDownload} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)} 
                                        disabled={currentPage === 1} 
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button 
                                            key={page} 
                                            onClick={() => handlePageChange(page)} 
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all duration-300 ${
                                                currentPage === page 
                                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' 
                                                    : 'border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)} 
                                        disabled={currentPage === totalPages} 
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Aucune archive trouvée pour cette année.</p>
                        </div>
                    )}
                </div>
            </section>
        </PageBanner>
    );
};

export default Archives;