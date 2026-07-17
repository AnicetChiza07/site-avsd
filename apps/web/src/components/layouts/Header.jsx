import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import blueLogo from '../../assets/images/Logo/logo.png';
import whiteLogo from '../../assets/images/Logo/white-logo.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    const location = useLocation();
    const currentPath = location.pathname;

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Actualités', href: '/actualites' },
        { name: 'Activités', href: '/activites' },
        { name: 'Opportunités', href: '/opportunites' },
        { name: 'Galerie', href: '/galerie' },
        { name: 'Contact', href: '/contact' },
    ];

    const isActiveLink = (href) => {
        if (href === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(href);
    };

    const isDarkMode = !isScrolled;

    return (
        <>
            {/* ✅ AUCUNE ANIMATION - Le blur est prioritaire */}

            <header className="fixed top-0 left-0 right-0 z-40">
                <div
                    className={`container mx-auto flex items-center justify-between px-4 py-2 mt-0 md:mt-2 rounded-lg border transition-all duration-300 ${
                        isScrolled
                            ? 'border-gray-300/50 bg-white/80 backdrop-blur-xl shadow-lg'
                            : 'border-white/30 bg-white/20 backdrop-blur-xl shadow-lg'
                    }`}
                >
                    <Link to="/" className="flex-shrink-0">
                        <img 
                            src={isDarkMode ? whiteLogo : blueLogo} 
                            alt="AVSD Logo" 
                            className="w-12 h-auto transition-all duration-300" 
                        />
                    </Link>

                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-6 font-body">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className={`relative transition-colors duration-300 ${
                                            isActiveLink(link.href)
                                                ? 'text-white bg-brand-blue rounded-lg px-5 py-2'
                                                : isDarkMode
                                                ? 'text-white/90 hover:text-white'
                                                : 'text-gray-800 hover:text-brand-blue'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <button
                        onClick={toggleMenu}
                        className={`md:hidden flex items-center justify-center w-11 h-11 rounded-lg transition-all duration-300 ${
                            isDarkMode 
                                ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                                : 'bg-brand-blue text-white'
                        }`}
                        aria-label="Menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Overlay pour mobile */}
            <div
                onClick={closeMenu}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
            />

            {/* Menu Mobile (Drawer) */}
            <nav
                className={`fixed top-0 right-0 w-[300px] h-screen bg-white z-50 transform transition-transform duration-300 ease-out md:hidden shadow-2xl ${
                    isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex justify-end p-4">
                    <button
                        onClick={closeMenu}
                        className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors duration-300"
                        aria-label="Fermer le menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-5 pb-6 border-b border-gray-200">
                    <img src={blueLogo} alt="AVSD Logo" className="w-16 h-auto" />
                </div>

                <div className="flex flex-col gap-2 p-5 pt-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            onClick={closeMenu}
                            className={`block w-full px-5 py-3 rounded-lg border transition-all duration-200 ${
                                isActiveLink(link.href)
                                    ? 'bg-brand-blue text-white border-brand-blue shadow-md'
                                    : 'text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </>
    );
};

export default Header;