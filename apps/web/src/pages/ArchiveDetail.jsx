import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download, FileText, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import archiveService from '../services/archiveService';
import { getBaseUrl } from '../services/api';

const ArchiveDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [archive, setArchive] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArchive = async () => {
            try {
                const res = await archiveService.getArchiveBySlug(slug);
                setArchive(res.data);
            } catch (error) {
                console.error('Erreur chargement archive:', error);
                navigate('/archives');
            } finally {
                setLoading(false);
            }
        };
        fetchArchive();
    }, [slug, navigate]);

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
            <section className="py-16 sm:py-24">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse mb-8" />
                        <div className="w-32 h-6 bg-slate-200 rounded animate-pulse mb-4" />
                        <div className="w-full h-12 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="w-full h-64 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </section>
        );
    }

    if (!archive) {
        return (
            <section className="py-16 sm:py-24">
                <div className="container text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Archive introuvable</h2>
                    <Link to="/archives" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-semibold rounded-xl hover:bg-brand-blue/90 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                        Retour aux archives
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            <SEO 
                title={archive.title}
                description={archive.excerpt}
                keywords={`archives AVSD, ${archive.title}, rapport RDC, document officiel`}
                url={`/archives/${archive.slug}`}
            />

            <section className="py-16 sm:py-24">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        {/* Bouton retour */}
                        <Link 
                            to="/archives" 
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue transition-colors mb-8"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Retour aux archives</span>
                        </Link>

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

                        {/* Métadonnées */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(archive.publishedAt || archive.createdAt)}</span>
                            </div>
                            {archive.featured && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                    À la une
                                </span>
                            )}
                        </div>

                        {/* Titre */}
                        <h1 className="text-4xl lg:text-5xl font-heading text-gray-900 mb-6 leading-tight">
                            {archive.title}
                        </h1>

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