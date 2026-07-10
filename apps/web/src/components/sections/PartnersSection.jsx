import { useState, useEffect } from 'react';
import partnerService from '../../services/partnerService';
import SectionTitle from '../ui/SectionTitle';
import { getImageUrl } from '../../services/api';

const PartnersSection = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await partnerService.getPartners();
                setPartners(res.data);
            } catch (error) {
                console.error('Erreur chargement partenaires:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    // On duplique les logos pour créer un défilement infini fluide
    const duplicatedPartners = [...partners, ...partners];

    if (loading) {
        return (
            <section data-theme="light" className="py-16 sm:py-20">
                <div className="container">
                    <SectionTitle badge="Nos Partenaires & collaborateurs" />
                    
                    {/* Skeleton des logos */}
                    <div className="flex items-center gap-10 mt-12 overflow-hidden">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[180px] h-[100px] bg-slate-200 rounded-xl animate-shimmer"
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (partners.length === 0) {
        return null; // Ne pas afficher la section si pas de partenaires
    }

    return (
        <section data-theme="light" className="py-16 sm:py-20">
            <div className="container">
                
                {/* Titre de la section */}
                <SectionTitle badge="Nos Partenaires & collaborateurs" />

                {/* Container des logos avec masque de fondu */}
                <div className="mask-fade-edges overflow-hidden w-full relative">
                    <div className="flex items-center gap-10 animate-scroll-logos w-max">
                        {duplicatedPartners.map((partner, index) => (
                            <div
                                key={`${partner._id}-${index}`}
                                className="flex-shrink-0 w-[180px] h-[100px] sm:w-[180px] sm:h-[100px] flex items-center justify-center"
                            >
                                <img
                                    src={getImageUrl(partner.image)}
                                    alt={`Partenaire ${index + 1}`}
                                    loading="lazy"
                                    className="max-w-full max-h-full object-contain transition-all duration-300 hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default PartnersSection;