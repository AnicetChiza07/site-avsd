import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Download, Calendar, MapPin, Briefcase, CheckCircle, Clock, Briefcase as BriefcaseIcon, GraduationCap, Award, FileText } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import SkeletonCard from '../components/ui/SkeletonCard';
import bgImage from '../assets/images/Caroussel/thirdCarrous.jpg';
import opportunityService from '../services/opportunityService';
import { getBaseUrl } from '../services/api';

const Opportunites = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                const res = await opportunityService.getOpportunities();
                setOpportunities(res.data);
            } catch (error) {
                console.error('Erreur chargement opportunités:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, []);

    const opportunityTypes = [
        { key: 'all', label: 'Toutes', icon: TrendingUp, color: 'bg-brand-blue', bgColor: 'bg-blue-50', textColor: 'text-brand-blue', borderColor: 'border-l-brand-blue' },
        { key: 'emploi', label: 'Emplois', icon: BriefcaseIcon, color: 'bg-blue-800', bgColor: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-l-blue-800' },
        { key: 'stage', label: 'Stages', icon: GraduationCap, color: 'bg-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-l-blue-600' },
        { key: 'bourse', label: 'Bourses', icon: Award, color: 'bg-sky-600', bgColor: 'bg-sky-50', textColor: 'text-sky-600', borderColor: 'border-l-sky-600' },
        { key: 'appel_offre', label: 'Appels d\'offre', icon: FileText, color: 'bg-indigo-700', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-l-indigo-700' }
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isOfferActive = (endDate) => {
        return new Date(endDate) >= new Date();
    };

    const filteredOpportunities = selectedType === 'all' 
        ? opportunities 
        : opportunities.filter(opp => opp.type === selectedType);

    const countsByType = useMemo(() => {
        const counts = { all: opportunities.length };
        opportunityTypes.forEach(type => {
            if (type.key !== 'all') {
                counts[type.key] = opportunities.filter(opp => opp.type === type.key).length;
            }
        });
        return counts;
    }, [opportunities]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

    const currentType = opportunityTypes.find(t => t.key === selectedType);

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

    return (
        <>
            {/* SEO Optimisé pour la page opportunités */}
            <SEO 
                title="Opportunités"
                description="Découvrez les opportunités de carrière à l'AVSD RDC : emplois, stages, bourses et appels d'offres. Rejoignez notre équipe humanitaire au Nord-Kivu."
                keywords="opportunités AVSD, emplois RDC, stages humanitaires, bourses Congo, appels d'offres, carrière Nord-Kivu, recrutement AVSD"
                url="/opportunites"
            />

            <PageBanner 
                title="Les opportunités" 
                subtitle="Découvrez les offres d'emploi, stages et autres opportunités chez AVSD."
                bgImage={bgImage}
                badge="Les offres"
                badgeIcon={TrendingUp}
            >
                <section data-theme="light" className="py-16 sm:py-24">
                    <div className="container">
                        
                        <SectionTitle 
                            badge="Opportunités"
                            title="Rejoignez notre équipe"
                            description="AVSD-RDC est toujours à la recherche de talents passionnés pour renforcer notre mission humanitaire. Consultez nos offres ci-dessous."
                        />

                        {!loading && (
                            <div className="flex flex-wrap gap-3 mb-12">
                                {opportunityTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.key}
                                            onClick={() => handleTypeChange(type.key)}
                                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                                selectedType === type.key
                                                    ? `${type.color} text-white shadow-lg scale-105`
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{type.label}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                selectedType === type.key
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {countsByType[type.key]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        ) : filteredOpportunities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOpportunities.map((opportunity, index) => {
                                    const active = isOfferActive(opportunity.endDate);
                                    
                                    return (
                                        <Link
                                            key={opportunity._id}
                                            to={`/opportunites/${opportunity._id}`}
                                            className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block ${
                                                !active ? 'opacity-75' : ''
                                            }`}
                                            style={{
                                                animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both`
                                            }}
                                        >
                                            {/* Image de couverture avec overlay */}
                                            <div className="relative h-56 overflow-hidden">
                                                <img 
                                                    src={opportunity.image 
                                                        ? (opportunity.image.startsWith('http') ? opportunity.image : `${getBaseUrl()}${opportunity.image}`)
                                                        : '/placeholder.jpg'
                                                    } 
                                                    alt={opportunity.title} 
                                                    loading="lazy"
                                                    className={`w-full h-full object-cover transition-transform duration-700 ${
                                                        active ? 'group-hover:scale-110' : ''
                                                    }`}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                                
                                                {/* Badge de type flottant en haut à gauche */}
                                                <div className="absolute top-4 left-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${currentType.color} rounded-lg shadow-lg backdrop-blur-sm`}>
                                                        <Briefcase className="w-3.5 h-3.5 text-white" />
                                                        <span className="text-xs font-bold text-white uppercase tracking-wide">
                                                            {opportunity.type === 'appel_offre' ? 'Appel d\'offre' : opportunity.type}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Badge de statut en haut à droite */}
                                                <div className="absolute top-4 right-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${
                                                        active 
                                                            ? 'bg-green-500/90 text-white' 
                                                            : 'bg-red-500/90 text-white'
                                                    }`}>
                                                        {active ? (
                                                            <>
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Expirée
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Titre sur l'image */}
                                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                                    <h3 className="text-xl font-heading text-white mb-2 line-clamp-2 drop-shadow-lg">
                                                        {opportunity.position || opportunity.title}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Contenu de la carte */}
                                            <div className="p-6">
                                                
                                                {/* Description - 2 lignes */}
                                                <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-2">
                                                    {opportunity.description}
                                                </p>

                                                {/* Métadonnées avec design amélioré */}
                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <MapPin className="w-4 h-4 text-brand-blue" />
                                                        </div>
                                                        <span className="font-medium">{opportunity.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Briefcase className="w-4 h-4 text-brand-blue" />
                                                        </div>
                                                        <span className="font-medium">{opportunity.contractType}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Calendar className="w-4 h-4 text-brand-blue" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {formatDate(opportunity.startDate)} - {formatDate(opportunity.endDate)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Bouton télécharger - ROUGE DOUX SI EXPIRÉ */}
                                                {opportunity.fileUrl && (
                                                    <button
                                                        disabled={!active}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
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
                                                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-300 shadow-sm group/btn ${
                                                            active 
                                                                ? `${currentType.color} text-white hover:opacity-90 shadow-lg shadow-brand-blue/20` 
                                                                : 'bg-rose-500 text-white cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <Download className={`w-4 h-4 ${active ? 'group-hover/btn:animate-bounce' : ''}`} />
                                                        <span>{active ? 'Télécharger l\'offre' : 'Offre expirée'}</span>
                                                    </button>
                                                )}

                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-500 text-lg">Aucune opportunité disponible dans cette catégorie pour le moment.</p>
                            </div>
                        )}

                    </div>
                </section>
            </PageBanner>
        </>
    );
};

export default Opportunites;