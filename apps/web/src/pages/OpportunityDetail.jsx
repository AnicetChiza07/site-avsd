import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Calendar, MapPin, Briefcase, ArrowLeft, Download, 
    ExternalLink, CheckCircle, Clock, AlertCircle 
} from 'lucide-react';
import opportunityService from '../services/opportunityService';
import { getBaseUrl } from '../services/api';

const OpportunityDetail = () => {
    const { id } = useParams();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOpportunity = async () => {
            try {
                setLoading(true);
                setError(false);
                const res = await opportunityService.getOpportunityById(id);
                setOpportunity(res.data);
            } catch (err) {
                console.error('Erreur chargement opportunité:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchOpportunity();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const isOfferActive = (endDate) => {
        return new Date(endDate) >= new Date();
    };

    const handleDownload = async (fileUrl, fileName) => {
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${getBaseUrl()}${fileUrl}`;
        try {
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Erreur lors du téléchargement');
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'offre-avsd.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            window.open(fullUrl, '_blank');
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

    if (error || !opportunity) {
        return (
            <section data-theme="light" className="pt-32 pb-16 min-h-screen flex items-center justify-center">
                <div className="container text-center">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-4xl font-heading text-gray-900 mb-4">Opportunité introuvable</h1>
                    <p className="text-gray-600 mb-8">Cette offre n'existe plus ou a été supprimée.</p>
                    <Link to="/opportunites" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Retour aux opportunités
                    </Link>
                </div>
            </section>
        );
    }

    const active = isOfferActive(opportunity.endDate);

    return (
        <>
            {/* Hero Section */}
            <section data-theme="dark" className="relative h-[60vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src={opportunity.image 
                            ? (opportunity.image.startsWith('http') ? opportunity.image : `${getBaseUrl()}${opportunity.image}`) 
                            : '/placeholder.jpg'} 
                        alt={opportunity.title} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-[#030d12]/95" />
                </div>
                <div className="container relative z-10 pb-16">
                    <div className="max-w-5xl">
                        
                        <Link 
                            to="/opportunites" 
                            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Voir les opportunités</span>
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-blue backdrop-blur-sm border border-brand-blue/30 rounded-lg text-sm font-bold text-white uppercase tracking-wide shadow-lg">
                                {opportunity.type === 'appel_offre' ? "Appel d'offre" : opportunity.type}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg ${
                                active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                                {active ? <><CheckCircle className="w-4 h-4" /> Active</> : <><Clock className="w-4 h-4" /> Expirée</>}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white mb-6 drop-shadow-lg">
                            {opportunity.position || opportunity.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>{opportunity.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                <span>{opportunity.contractType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>Début : {formatDate(opportunity.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>Clôture : {formatDate(opportunity.endDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenu principal avec Sidebar */}
            <section data-theme="light" className="py-16 sm:py-24">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        <div className="lg:col-span-8">
                            <div className="prose prose-lg max-w-none">
                                <h2 className="text-2xl font-heading text-gray-900 mb-6">Détails de l'offre</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {opportunity.description}
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-4">
                            <div className="sticky top-8 space-y-6">
                                
                                {opportunity.image && (
                                    <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 group">
                                        <img 
                                            src={opportunity.image.startsWith('http') ? opportunity.image : `${getBaseUrl()}${opportunity.image}`} 
                                            alt={opportunity.title} 
                                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                )}

                                {/* Boutons d'action */}
                                <div className="space-y-3">
                                    {opportunity.fileUrl && (
                                        <button
                                            disabled={!active}
                                            onClick={() => {
                                                if (!active) return;
                                                const rawName = opportunity.position || opportunity.title;
                                                const cleanName = rawName
                                                    .normalize('NFD')
                                                    .replace(/[\u0300-\u036f]/g, '')
                                                    .replace(/\s+/g, '-')
                                                    .replace(/[^a-zA-Z0-9-]/g, '')
                                                    .toLowerCase();
                                                handleDownload(opportunity.fileUrl, `${cleanName}.pdf`);
                                            }}
                                            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all duration-300 group ${
                                                active 
                                                    ? 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40' 
                                                    : 'bg-rose-500 text-white cursor-not-allowed'
                                            }`}
                                        >
                                            <Download className={`w-5 h-5 ${active ? 'group-hover:animate-bounce' : ''}`} />
                                            <span>{active ? 'Télécharger l\'offre complète' : 'Offre expirée'}</span>
                                        </button>
                                    )}
                                    
                                    {opportunity.link && (
                                        <a
                                            href={active ? opportunity.link : undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${
                                                active 
                                                    ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-blue hover:text-brand-blue' 
                                                    : 'bg-rose-100 border-2 border-rose-200 text-rose-400 cursor-not-allowed pointer-events-none'
                                            }`}
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            <span>{active ? 'Postuler via le site officiel' : 'Offre expirée'}</span>
                                        </a>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};

export default OpportunityDetail;