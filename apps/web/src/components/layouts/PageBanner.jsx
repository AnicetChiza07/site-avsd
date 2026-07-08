import PropTypes from 'prop-types';
import { MessageCircle } from 'lucide-react';

const PageBanner = ({ title, subtitle, bgImage, badge = "Contact", badgeIcon: BadgeIcon = MessageCircle, children }) => {
    return (
        <>
            {/* Section Bannière (Image de fond + Titre) */}
            <section data-theme="dark" className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
                
                {/* Image de fond dynamique */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src={bgImage} 
                        alt={title} 
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay sombre avec gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030d12f0] via-[#030d12e0] to-[#030d12f0]" />
                </div>

                {/* Halos lumineux décoratifs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

                {/* Contenu centré */}
                <div className="container relative z-10 flex flex-col items-center justify-center text-center gap-6 py-20">
                
                {/* Badge avec icône (style glassmorphism) */}
                <div 
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg"
                    style={{
                    animation: 'fadeInDown 0.6s ease-out both'
                    }}
                >
                    <BadgeIcon className="w-5 h-5 text-white" strokeWidth={2} />
                    <span className="text-white font-medium text-sm uppercase tracking-wide">
                        {badge}
                    </span>
                </div>

                {/* Titre avec gradient */}
                <h1 
                    className="w-full md:w-[80%] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-light"
                    style={{
                    animation: 'fadeInUp 0.8s ease-out 0.2s both'
                    }}
                >
                    {title}
                </h1>

                {/* Sous-titre / Description */}
                {subtitle && (
                    <p 
                    className="w-full md:w-[60%] text-lg md:text-xl text-white/70 leading-relaxed"
                    style={{
                        animation: 'fadeInUp 0.8s ease-out 0.4s both'
                    }}
                    >
                    {subtitle}
                    </p>
                )}

                </div>
            </section>

            {/* Section Contenu (Le contenu spécifique de chaque page) */}
            <main className="relative z-10">
                {children}
            </main>
        </>
    );
};

PageBanner.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    bgImage: PropTypes.string.isRequired,
    badge: PropTypes.string,
    badgeIcon: PropTypes.elementType,
    children: PropTypes.node.isRequired,
};

export default PageBanner;