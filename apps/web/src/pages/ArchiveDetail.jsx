import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Calendar, ArrowLeft, Download, Share2, AlertCircle, FileText, Star
} from 'lucide-react';
import SEO from '../components/SEO';
import archiveService from '../services/archiveService';
import { getBaseUrl } from '../services/api';

const ArchiveDetail = () => {
    const { slug } = useParams();
    const [archive, setArchive] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                setLoading(true);
                setError(false);
                const res = await archiveService.getArchiveBySlug(slug);
                setArchive(res.data || res);
            } catch (err) {
                console.error('Erreur chargement archive:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchArchive();
    }, [slug]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const handleDownload = async () => {
        if (!archive?.fileUrl) return;
        const fullUrl = archive.fileUrl.startsWith('http') 
            ? archive.fileUrl 
            : `${getBaseUrl()}${archive.fileUrl}`;
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Erreur lors du téléchargement');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${archive.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            window.open(fullUrl, '_blank');
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: archive.title,
                text: archive.excerpt,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers');
        }
    };

    if (loading) {
        return (
            <section className="relative h-[60vh] flex items-center overflow-hidden bg-slate-900">
                <div className="container relative z-10 flex flex-col justify-center h-full py-20">
                    <div className="max-w-3xl space-y-6">
                        <div className="w-32 h-8 bg-slate-700 rounded-full animate-shimmer" />
                        <div className="w-3/4 h-12 bg-slate-700 rounded-xl animate-shimmer" />
                        <div className="space-y-3">
                            <div className="w-full h-4 bg-slate-700 rounded-full animate-shimmer" />
                            <div className="w-5/6 h-4 bg-slate-700 rounded-full animate-shimmer" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || !archive) {
        return (
            <section data-theme="light" className="pt-32 pb-16 min-h-screen flex items-center justify-center">
                <div className="container text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-4xl font-heading text-gray-900 mb-4">Archive introuvable</h1>
                    <p className="text-gray-600 mb-8">Cette archive n'existe plus ou a été supprimée.</p>
                    <Link to="/archives" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Retour aux archives
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* SEO Dynamique */}
            <SEO 
                title={archive.title}
                description={archive.excerpt}
                keywords={`archives AVSD, ${archive.title}, rapport RDC, document officiel`}
                image={archive.coverImage ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`) : undefined}
                url={`/archives/${archive.slug}`}
            />

            {/* Hero Section */}
            <section data-theme="dark" className="relative h-[60vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={archive.coverImage 
                            ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`) 
                            : '/placeholder.jpg'} 
                        alt={archive.title} 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-[#030d12]/95" />
                </div>
                <div className="container relative z-10 pb-16">
                    <div className="max-w-5xl">
                        
                        <Link 
                            to="/archives" 
                            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Voir les archives</span>
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue backdrop-blur-sm border border-brand-blue/30 rounded-lg text-sm font-bold text-white uppercase tracking-wide shadow-lg">
                                <FileText className="w-4 h-4" />
                                Archive
                            </span>
                            {archive.featured && (
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg">
                                    <Star className="w-4 h-4 fill-yellow-300" /> À la une
                                </span>
                            )}
                        </div>

                        {/* Titre en GRADIENT */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-lg bg-gradient-to-r from-brand-blue to-brand-light bg-clip-text text-transparent">
                            {archive.title}
                        </h1>

                        {/* Date et Auteur */}
                        <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>Publié le {formatDate(archive.publishedAt || archive.createdAt)}</span>
                            </div>
                            
                            {/* NOUVEAU : Badge Auteur */}
                            {archive.author && (
                                <div className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                    <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-[10px] font-bold">
                                            {archive.author.initials || 'AVSD'}
                                        </span>
                                    </div>
                                    <span className="font-medium text-white/90">
                                        {archive.author.name || 'AVSD RDC'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenu principal */}
            <section className="py-16 sm:py-24">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        {/* Image de couverture */}
                        <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl">
                            <img 
                                src={archive.coverImage 
                                    ? (archive.coverImage.startsWith('http') ? archive.coverImage : `${getBaseUrl()}${archive.coverImage}`)
                                    : '/placeholder.jpg'} 
                                alt={archive.title} 
                                className="w-full h-96 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Synthèse */}
                        <p className="text-xl text-gray-600 leading-relaxed mb-8 pb-8 border-b border-gray-200">
                            {archive.excerpt}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 mb-12">
                            <button 
                                onClick={handleDownload}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl"
                            >
                                <Download className="w-5 h-5" />
                                Télécharger le PDF
                            </button>
                            <button 
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                            >
                                <Share2 className="w-5 h-5" />
                                Partager
                            </button>
                        </div>

                        {/* Description complète */}
                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {archive.description}
                            </div>
                        </div>

                        {/* Bouton télécharger en bas */}
                        <div className="mt-12 p-8 bg-gradient-to-br from-brand-blue/5 to-brand-light/5 rounded-2xl border border-brand-blue/10">
                            <div className="flex items-start justify-between gap-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Téléchargez ce document
                                    </h3>
                                    <p className="text-gray-600">
                                        Obtenez une copie complète de ce rapport en format PDF.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleDownload}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 whitespace-nowrap"
                                >
                                    <Download className="w-5 h-5" />
                                    Télécharger
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ArchiveDetail;