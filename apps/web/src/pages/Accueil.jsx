import SEO from '../components/SEO';
import HeroSection from '../components/sections/HeroSection'
import PartnersSection from '../components/sections/PartnersSection';
import AboutSection from '../components/sections/AboutSection';
import MissionSection from '../components/sections/MissionSection';
import ZonesInterventionSection from '../components/sections/ZonesInterventionSection';
import InterventionAreasSection from '../components/sections/InterventionAreasSection';
import BlogSection from '../components/sections/BlogSection';
import CTASection from '../components/sections/CTASection';
import StatsSection from '../components/sections/StatsSection';

const Accueil = () => {
    return (
        <div>
            {/* SEO Optimisé pour la page d'accueil */}
            <SEO 
                title="Accueil"
                description="AVSD RDC : association humanitaire œuvrant pour le développement communautaire, la paix, l'autonomisation des femmes et l'aide aux déplacés en RDC."
                keywords="AVSD RDC, association humanitaire, développement communautaire, RDC, Congo, solidarité, autonomisation femmes, paix, Nord-Kivu, aide humanitaire"
                url="/"
            />
            
            <HeroSection />
            <PartnersSection />
            <AboutSection />
            <MissionSection />
            <ZonesInterventionSection />
            <InterventionAreasSection />
            <BlogSection />
            <CTASection />
            <StatsSection />
        </div>
    )
}

export default Accueil