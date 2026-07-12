import { Phone, Mail, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../../assets/images/Logo/white-logo.png';

const Footer = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
            const handleScroll = () => {
            setShowScrollTop(window.scrollY > window.innerHeight);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer data-theme="dark" className="relative bg-slate-900 text-white overflow-hidden">
        
                {/* Pattern de fond subtil */}
                <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}
                />

            {/* Halo lumineux décoratif */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

                <div className="container relative z-10 py-16">
          
                    {/* Section À propos */}
                    <div className="flex flex-col md:flex-row items-start gap-6 pb-12 border-b border-white/10">
                        <img 
                            src={logo} 
                            alt="AVSD Logo" 
                            className="w-24 h-auto flex-shrink-0"
                        />
                        {/* On limite la largeur du texte pour une meilleure lisibilité */}
                        <div className="md:w-2/3 lg:w-1/2">
                            <h3 className="text-xl font-heading text-white mb-3">À propos</h3>
                            <p className="text-white/60 leading-relaxed italic">
                                Nous portons secours et assistance aux personnes en détresse, en zones de conflit comme en zones stables, pour un avenir meilleur.
                            </p>
                        </div>
                    </div>

                    {/* Grille principale : Navigation + Contacts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12 border-b border-white/10">
                        
                        {/* Navigation (Gauche) */}
                        <div>
                            <h3 className="text-lg font-heading text-white mb-6">Navigation</h3>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { name: 'Accueil', href: '/', active: true },
                                    { name: 'Les actualités', href: '/actualites', active: false },
                                    { name: 'Nos activités', href: '/activites', active: false },
                                    { name: 'Les opportunités', href: '/opportunites', active: false },
                                    { name: 'Nos archives', href: '/archives', active: false },
                                    { name: 'Notre galerie', href: '/galerie', active: false },
                                    { name: 'Nous contacter', href: '/contact', active: false },
                                    ].map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                                        link.active
                                            ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Contacts (Droite) - Avec la ligne de séparation */}
                        <div className="md:border-l md:border-white/10 md:pl-12">
                            <h3 className="text-lg font-heading text-white mb-6">Contacts</h3>
                        
                            {/* Informations de contact */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                <a
                                    href="tel:+243999107243"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>+243 999 107 243</span>
                                </a>
                                <a
                                    href="mailto:contact@avsd-drcongo.org"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>contact@avsd-drcongo.org</span>
                                </a>
                            </div>

                            {/* Réseaux sociaux */}
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-white/50">Suivez-nous:</span>
                                <div className="flex gap-3">
                                
                                    {/* X (Twitter) */}
                                    <a
                                        href="#"
                                        aria-label="X (Twitter)"
                                        className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-brand-blue hover:border-brand-blue transition-all duration-300 group"
                                    >
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                    </a>

                                    {/* Facebook */}
                                    <a
                                        href="#"
                                        aria-label="Facebook"
                                        className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-brand-blue hover:border-brand-blue transition-all duration-300 group"
                                    >
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </a>

                                    {/* Instagram */}
                                    <a
                                        href="#"
                                        aria-label="Instagram"
                                        className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-brand-blue hover:border-brand-blue transition-all duration-300 group"
                                    >
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                        </svg>
                                    </a>

                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Copyright */}
                    <div className="pt-8 text-center">
                        <p className="text-sm text-white/40">
                            &copy; {currentYear} AVSD-RDC. Tous droits réservés.
                        </p>
                    </div>

                </div>
            </footer>

            {/* Bouton Scroll to Top */}
            <button
                onClick={scrollToTop}
                className={`fixed right-6 bottom-6 z-50 w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-blue/30 hover:bg-brand-blue/90 hover:scale-110 transition-all duration-300 ${
                showScrollTop ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                aria-label="Retour en haut"
            >
                <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
        </>
    );
};

export default Footer;