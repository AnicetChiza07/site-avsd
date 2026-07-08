import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import milieuService from '../../services/milieuService';

const InterventionAreasSection = () => {
    const [provinces, setProvinces] = useState([]);
    const [villes, setVilles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(null);

    useEffect(() => {
        const fetchMilieux = async () => {
            try {
                const res = await milieuService.getMilieux();
                const allMilieux = res.data;
                
                // Séparer provinces et villes
                let provincesList = allMilieux.filter(m => m.type === 'province');
                const villesList = allMilieux.filter(m => m.type === 'ville');
                
                // Trier les provinces : Nord-kivu en premier, puis les autres alphabétiquement
                provincesList.sort((a, b) => {
                    if (a.name.toLowerCase() === 'nord-kivu') return -1;
                    if (b.name.toLowerCase() === 'nord-kivu') return 1;
                    return a.name.localeCompare(b.name);
                });
                
                setProvinces(provincesList);
                setVilles(villesList);
                
                // Définir la première province (Nord-kivu) comme filtre actif
                if (provincesList.length > 0) {
                    setActiveFilter(provincesList[0]._id);
                }
            } catch (error) {
                console.error('Erreur chargement milieux:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMilieux();
    }, []);

    // Trouver la province active
    const activeProvince = provinces.find((prov) => prov._id === activeFilter);

    // Filtrer les villes de la province active
    const villesDeLaProvince = activeProvince 
        ? villes.filter(ville => ville.province === activeProvince.name)
        : [];

    // Changer de filtre
    const handleFilterClick = (provinceId) => {
        setActiveFilter(provinceId);
    };

    if (loading) {
        return (
            <section data-theme="light" className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
                <div className="container">
                    <SectionTitle 
                        badge="Terrains"
                        title="Nos milieux d'intervention"
                        description="Découvrez les territoires où nos équipes agissent quotidiennement pour accompagner les communautés."
                    />

                    {/* Skeleton des filtres (boutons de provinces) */}
                    <div className="mt-12">
                        <div className="flex flex-wrap gap-3">
                            <div className="w-32 h-12 bg-slate-200 rounded-full animate-shimmer" />
                            <div className="w-28 h-12 bg-slate-200 rounded-full animate-shimmer" />
                            <div className="w-24 h-12 bg-slate-200 rounded-full animate-shimmer" />
                        </div>
                    </div>

                    {/* Skeleton de l'en-tête de la province */}
                    <div className="mt-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                            <div className="flex-1">
                                <div className="w-48 h-8 bg-slate-200 rounded-lg animate-shimmer mb-2" />
                                <div className="w-64 h-4 bg-slate-200 rounded-full animate-shimmer" />
                            </div>
                            <div className="w-48 h-10 bg-slate-200 rounded-full animate-shimmer" />
                        </div>

                        {/* Skeleton de la grille des villes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-xl p-5 border border-gray-200/50"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Icône skeleton */}
                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-200 rounded-lg animate-shimmer" />
                                        
                                        {/* Texte skeleton */}
                                        <div className="flex-1 space-y-2">
                                            <div className="w-3/4 h-4 bg-slate-200 rounded-full animate-shimmer" />
                                            <div className="w-full h-3 bg-slate-200 rounded-full animate-shimmer" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (provinces.length === 0) {
        return null;
    }

    return (
        <section data-theme="light" className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            <div className="container">
                
                {/* Titre de la section */}
                <SectionTitle 
                    badge="Terrains"
                    title="Nos milieux d'intervention"
                    description="Découvrez les territoires où nos équipes agissent quotidiennement pour accompagner les communautés."
                />

                {/* Filtres - Uniquement les provinces */}
                <div className="mt-12">
                    <div className="flex flex-wrap gap-3">
                        {provinces.map((province) => (
                            <button
                                key={province._id}
                                onClick={() => handleFilterClick(province._id)}
                                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                                    activeFilter === province._id
                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-brand-blue hover:text-brand-blue'
                                }`}
                            >
                                {province.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenu de la province active */}
                {activeProvince && (
                    <div className="mt-10">
                        
                        {/* En-tête de la province */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-2xl font-heading text-gray-900 mb-1">
                                    {activeProvince.name}
                                </h3>
                                <p className="text-gray-600 text-sm">{activeProvince.description || `Interventions dans la province de ${activeProvince.name}`}</p>
                            </div>
                            
                            {/* Compteur de villes */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full">
                                <CheckCircle2 className="w-5 h-5 text-brand-blue" />
                                <span className="text-brand-blue font-semibold">
                                    {villesDeLaProvince.length} {villesDeLaProvince.length > 1 ? 'zones' : 'zone'} d'intervention
                                </span>
                            </div>
                        </div>

                        {/* Grille des villes/zones */}
                        {villesDeLaProvince.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {villesDeLaProvince.map((ville, index) => (
                                    <div
                                        key={ville._id}
                                        className="group relative bg-white rounded-xl p-5 border border-gray-200/50 hover:border-brand-blue/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                        style={{
                                            animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Icône de localisation */}
                                            <div className="flex-shrink-0 w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center group-hover:bg-brand-blue group-hover:scale-110 transition-all duration-300">
                                                <MapPin className="w-5 h-5 text-brand-blue group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            
                                            {/* Texte de la ville */}
                                            <div className="flex-1">
                                                <p className="text-gray-900 text-sm">
                                                    {ville.name}
                                                </p>
                                                {ville.description && (
                                                    <p className="text-gray-600 text-xs leading-relaxed mt-0.5">
                                                        {ville.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ligne décorative en bas */}
                                        <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Aucune zone d'intervention définie pour cette province.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
};

export default InterventionAreasSection;