import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import bgImage from '../assets/images/Hero/herobg.jpg';
import archiveService from '../services/archiveService';
import { getBaseUrl } from '../services/api';

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
                setArchives(res.data);
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
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDateParts = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }),
            year: date.getFullYear()
        };
    };

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
                    {loading ? (
                        <div className="mb-16">
                            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="h-64 lg:h-auto w-full bg-slate-200 rounded-xl animate-pulse" />
                                    <div className="flex flex-col justify-center p-4">
                                        <div className="w-24 h-6 bg-slate-200 rounded-full animate-pulse mb-4" />
                                        <div className="w-full h-8 bg-slate-200 rounded animate-pulse mb-4" />
                                        <div className="w-full h-20 bg-slate-200 rounded animate-pulse mb-6" />
                                        <div className="w-40 h-10 bg-slate-200 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : featuredArchive && (
                        <div className="mb-16">
                            <Link to={`/archives/${featuredArchive.slug}`} className="block">
                                <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                                    <div className="grid grid-cols-1 lg:grid-cols-2">
                                        <div className="relative h-64 lg:h-auto overflow-hidden">
                                            <img 
                                                src={featuredArchive.coverImage 
                                                    ? (featuredArchive.coverImage.startsWith('http') ? featuredArchive.coverImage : `${getBaseUrl()}${featuredArchive.coverImage}`)
                                                    : '/placeholder.jpg'} 
                                                alt={featuredArchive.title} 
                                                loading="lazy" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                            <div className="absolute top-4 left-4 px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-full shadow-lg">À la une</div>
                                        </div>
                                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                                            <h2 className="text-2xl lg:text-3xl font-heading text-gray-900 mb-4 group-hover:text-brand-blue transition-colors duration-300">
                                                {featuredArchive.title}
                                            </h2>
                                            
                                            <p className="text-gray-600 text-base leading-relaxed mb-6">
                                                {featuredArchive.excerpt}
                                            </p>
                                            
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(featuredArchive.publishedAt || featuredArchive.createdAt)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl group/link">
                                                    <span>Voir le détail</span>
                                                    <ArrowUpRight className="w-5 h-5 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                                                </div>
                                                <button 
                                                    onClick={(e) => handleDownload(e, featuredArchive.fileUrl, `${featuredArchive.title}.pdf`)}
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    <span>Télécharger</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}

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

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
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
                    ) : currentArchives.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {currentArchives.map((archive, index) => {
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
                                                
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                
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
                                                <div className="inline-flex items-center gap-2 text-brand-blue font-medium text-sm group/link">
                                                    <span>Voir le détail</span>
                                                    <ArrowUpRight className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        </Link>
                                    );
                                })}
                            </div>
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