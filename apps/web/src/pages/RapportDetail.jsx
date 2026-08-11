import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, ArrowLeft, FileText, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import archiveService from '../services/archiveService'; // Le service backend peut garder ce nom
import { getImageUrl } from '../services/api';

const RapportDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [rapport, setRapport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRapport = async () => {
            try {
                // On utilise le même service, le backend comprendra le slug
                const res = await archiveService.getArchiveBySlug(slug); 
                setRapport(res.data);
            } catch (error) {
                console.error('Erreur chargement du rapport:', error);
                navigate('/rapports'); // Redirection si le rapport n'existe pas
            } finally {
                setLoading(false);
            }
        };
        fetchRapport();
    }, [slug, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleDownload = async (fileUrl, fileName) => {
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : getImageUrl(fileUrl);
        
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Erreur téléchargement');
            
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.warn('Téléchargement direct échoué, ouverture dans un nouvel onglet:', err);
            window.open(fullUrl, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!rapport) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rapport introuvable</h2>
                <Link to="/rapports" className="text-brand-blue hover:underline">← Retour aux rapports</Link>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title={rapport.title}
                description={rapport.excerpt || `Consultez le rapport : ${rapport.title}`}
                url={`/rapports/${rapport.slug}`}
            />

            <PageBanner 
                title={rapport.title} 
                subtitle="Détail du document" 
                badge="Rapport" 
            >
                <section data-theme="light" className="py-16 sm:py-24">
                    <div className="container max-w-4xl">
                        
                        {/* Bouton Retour */}
                        <Link 
                            to="/rapports" 
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue font-medium mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à tous les rapports
                        </Link>

                        {/* Image de couverture */}
                        {rapport.coverImage && (
                            <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
                                <img 
                                    src={getImageUrl(rapport.coverImage)} 
                                    alt={rapport.title}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/800x400?text=Document';
                                    }}
                                />
                            </div>
                        )}

                        {/* Métadonnées */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-blue" />
                                <span>{formatDate(rapport.publishedAt || rapport.createdAt)}</span>
                            </div>
                            {rapport.readTime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-brand-blue" />
                                    <span>{rapport.readTime} de lecture</span>
                                </div>
                            )}
                            {rapport.category && (
                                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold">
                                    {rapport.category.name}
                                </span>
                            )}
                        </div>

                        {/* Contenu du rapport */}
                        <div className="prose prose-lg max-w-none text-gray-700 mb-12">
                            {/* Si ton backend renvoie du HTML, utilise dangerouslySetInnerHTML */}
                            <div dangerouslySetInnerHTML={{ __html: rapport.content || rapport.description }} />
                        </div>

                        {/* Zone de téléchargement */}
                        {rapport.fileUrl && (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Télécharger le document complet</h4>
                                        <p className="text-sm text-gray-500">Format PDF • {rapport.fileSize || 'Taille non spécifiée'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDownload(rapport.fileUrl, `${rapport.title}.pdf`)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white font-medium rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-brand-blue/20"
                                >
                                    <Download className="w-5 h-5" />
                                    Télécharger
                                </button>
                            </div>
                        )}

                    </div>
                </section>
            </PageBanner>
        </>
    );
};

export default RapportDetail;