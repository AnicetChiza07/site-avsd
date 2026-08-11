import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import bgImage from '../assets/images/Hero/herobg.jpg';
import archiveService from '../services/archiveService'; // On garde le service tel quel
import { getImageUrl } from '../services/api'; // ✅ Utilisation de notre fonction robuste

// Composant carte rapport
const RapportCard = ({ rapport, index, isFeatured = false, onDownload }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <Link 
            to={`/rapports/${rapport.slug}`} // ✅ URL changée en /rapports
            className={`group relative ${isFeatured ? 'h-[500px]' : 'h-96'} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block`}
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
        >
            {/* Image de couverture en background avec getImageUrl */}
            <img 
                src={rapport.coverImage ? getImageUrl(rapport.coverImage) : '/placeholder.jpg'} 
                alt={rapport.title} 
                loading="lazy" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/800x600?text=Document';
                }}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

            {/* Contenu */}
            <div className={`absolute inset-0 ${isFeatured ? 'p-8 lg:p-12' : 'p-6'} flex flex-col justify-between`}>
                {/* Date en haut */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(rapport.publishedAt || rapport.createdAt)}</span>
                    </div>
                    {rapport.featured && (
                        <span className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-full shadow-lg">
                            À la une
                        </span>
                    )}
                </div>

                {/* Titre et description en bas */}
                <div className="space-y-3">
                    <h3 className={`${isFeatured ? 'text-2xl lg:text-3xl' : 'text-xl'} font-heading text-white mb-2 line-clamp-2 leading-tight drop-shadow-lg`}>
                        {rapport.title}
                    </h3>
                    <p className={`text-white/90 ${isFeatured ? 'text-base' : 'text-sm'} leading-relaxed line-clamp-2 drop-shadow-md`}>
                        {rapport.excerpt}
                    </p>

                    {/* Actions en bas */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium group/link">
                            <span>Voir le document</span>
                            <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </div>
                        <button 
                            onClick={(e) => onDownload(e, rapport.fileUrl, `${rapport.title}.pdf`)}
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

const Rapports = () => { // ✅ Nom du composant changé
    const [rapports, setRapports] = useState([]); // ✅ Variables renommées
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const rapportsPerPage = 12;

    useEffect(() => {
        const fetchRapports = async () => {
            try {
                const res = await archiveService.getArchives(); // Le backend peut garder le nom "archives"
                const rapportsData = Array.isArray(res) ? res : (res.data || []);
                setRapports(rapportsData);
            } catch (error) {
                console.error('Erreur chargement rapports:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRapports();
    }, []);

    const years = useMemo(() => {
        if (rapports.length === 0) return [];
        const yearsSet = new Set();
        rapports.forEach(rapport => {
            const year = new Date(rapport.publishedAt || rapport.createdAt).getFullYear();
            yearsSet.add(year);
        });
        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [rapports]);

    const featuredRapport = useMemo(() => rapports.find(rapport => rapport.featured), [rapports]);

    const filteredRapports = useMemo(() => {
        let filtered = rapports;
        
        if (featuredRapport) {
            filtered = rapports.filter(rapport => rapport._id !== featuredRapport._id);
        }
        
        if (selectedYear !== 'Tous') {
            filtered = filtered.filter(rapport => {
                const rapportYear = new Date(rapport.publishedAt || rapport.createdAt).getFullYear().toString();
                return rapportYear === selectedYear;
            });
        }
        
        return filtered;
    }, [rapports, selectedYear, featuredRapport]);

    const totalPages = Math.ceil(filteredRapports.length / rapportsPerPage);
    const startIndex = (currentPage - 1) * rapportsPerPage;
    const currentRapports = filteredRapports.slice(startIndex, startIndex + rapportsPerPage);

    const handleYearChange = (year) => { setSelectedYear(year); setCurrentPage(1); };
    const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const handleDownload = async (e, fileUrl, fileName) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : getImageUrl(fileUrl); // ✅ getImageUrl utilisé ici aussi
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
        <PageBanner 
            title="Nos rapports" // ✅ Texte changé
            subtitle="Consultez nos rapports, documents et publications." 
            bgImage={bgImage} 
            badge="Rapports" // ✅ Badge changé
            badgeIcon={FileText}
        >
            <SEO 
                title="Nos rapports" // ✅ SEO changé
                description="Consultez les rapports de l'AVSD RDC : rapports d'activités, documents officiels, publications et ressources sur nos actions humanitaires en RDC."
                keywords="rapports AVSD, rapports RDC, documents officiels, publications, ressources humanitaires"
                url="/rapports" // ✅ URL SEO changée
            />
            
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    {/* Rapport à la une */}
                    {loading ? (
                        <div className="mb-16">
                            <div className="relative h-[500px] bg-slate-200 rounded-2xl animate-pulse" />
                        </div>
                    ) : featuredRapport && (
                        <div className="mb-16">
                            <RapportCard rapport={featuredRapport} index={0} isFeatured={true} onDownload={handleDownload} />
                        </div>
                    )}

                    {/* Filtres par année */}
                    <SectionTitle 
                        badge="Filtrer par année" 
                        title="Parcourez nos rapports" // ✅ Titre changé
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
                                Tous les rapports {/* ✅ Texte changé (masculin) */}
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

                    {/* Grille des rapports */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="relative h-96 bg-slate-200 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : currentRapports.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentRapports.map((rapport, index) => (
                                    <RapportCard key={rapport._id} rapport={rapport} index={index} onDownload={handleDownload} />
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
                            <p className="text-gray-500 text-lg">Aucun rapport trouvé pour cette année.</p> {/* ✅ Texte changé */}
                        </div>
                    )}
                </div>
            </section>
        </PageBanner>
    );
};

export default Rapports;