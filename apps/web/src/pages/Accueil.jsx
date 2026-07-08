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
