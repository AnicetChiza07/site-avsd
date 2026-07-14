import { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import bgImage from '../assets/images/Hero/AVSD-kits.jpg';
import api from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Effacer l'erreur quand l'utilisateur tape
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        
        try {
            // Envoi réel vers le backend
            await api.post('/contacts', {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            // Succès
            setIsSubmitting(false);
            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Masquer le message de succès après 5 secondes
            setTimeout(() => setIsSubmitted(false), 5000);
            
        } catch (err) {
            console.error('Erreur lors de l\'envoi:', err);
            setIsSubmitting(false);
            
            // Message d'erreur personnalisé
            const errorMessage = err.response?.data?.message || 
                               'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.';
            setError(errorMessage);
            
            // Masquer l'erreur après 5 secondes
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <>
            {/* SEO Optimisé pour la page contact */}
            <SEO 
                title="Contactez-nous"
                description="Contactez l'AVSD RDC à Goma, Nord-Kivu. Téléphone, email et formulaire de contact pour toute question sur nos projets humanitaires et communautaires en RDC."
                keywords="contact AVSD, AVSD RDC, Goma, Nord-Kivu, formulaire contact, humanitaire RDC, association Congo, téléphone AVSD"
                url="/contact"
            />

            <PageBanner 
                title="Entrez en contact" 
                subtitle="Retrouvez comment nous joindre via nos différentes adresses."
                bgImage={bgImage}
                badge="Contact"
                badgeIcon={MessageCircle}
            >
            <section data-theme="light" className="py-16 sm:py-24 border-t border-gray-300/40">
                <div className="container">
                
                {/* Titre de la section avec SectionTitle */}
                <SectionTitle 
                    badge="Formulaire de contact"
                    description="Complétez ce formulaire en inscrivant les renseignements demandés afin de nous laisser un message que nous allons lire dans les prochaines heures."
                />

                {/* Layout 2 colonnes : Formulaire à gauche, Infos à droite */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mt-12">
                    
                    {/* Colonne gauche : Formulaire */}
                    <div>
                    <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200/50 shadow-xl shadow-gray-200/20 h-full">
                        
                        {/* Message de succès */}
                        {isSubmitted && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-green-800 text-sm">
                            Votre message a été envoyé avec succès ! Nous vous répondrons dans les prochaines heures.
                            </p>
                        </div>
                        )}

                        {/* Message d'erreur */}
                        {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-red-800 text-sm">
                                {error}
                            </p>
                        </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Nom complet */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-300 outline-none"
                                placeholder="Ex: Aganze Mushagalusa"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse e-mail
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-300 outline-none"
                                placeholder="votreadressemail@gmail.com"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Titre du message */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Titre de votre message
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-300 outline-none"
                                placeholder="Ex: Demande de votre service"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Votre message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-4 py-3.5 bg-transparent border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all duration-300 outline-none resize-none"
                                placeholder="Message..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Bouton d'envoi */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue/90 transition-all duration-300 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:shadow-brand-blue/40 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Envoi en cours...</span>
                            </>
                            ) : (
                            <>
                                <Send className="w-5 h-5" strokeWidth={2} />
                                <span>Envoyer le message</span>
                            </>
                            )}
                        </button>

                        </form>
                    </div>
                    </div>

                    {/* Colonne droite : Informations de contact avec fond bleu gradient */}
                    <div className="flex flex-col justify-center">
                        <div className="bg-gradient-to-br flex flex-col justify-center from-brand-blue to-slate-900 rounded-2xl p-8 md:p-10 shadow-xl shadow-brand-blue/20 h-full">
                            
                            {/* Titre */}
                            <h3 className="text-2xl font-heading text-white mb-8">
                                Nos coordonnées
                            </h3>
                            
                            {/* Liste des informations */}
                            <div className="space-y-0">
                            
                            {/* Téléphone */}
                            <div className="border-t border-white/10 py-5">
                                <a 
                                    href="tel:+243999107243"
                                    className="flex items-center gap-3 group"
                                >
                                <div className="w-11 h-11 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg group-hover:bg-white/20 transition-colors duration-300 flex-shrink-0">
                                    <Phone className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Téléphone</p>
                                    <p className="text-white font-medium group-hover:text-brand-light transition-colors duration-300">
                                        +243 999 107 243
                                    </p>
                                </div>
                                </a>
                            </div>

                            {/* Email */}
                            <div className="border-t border-white/10 py-5">
                                <a 
                                    href="mailto:contact@avsd-drcongo.org"
                                    className="flex items-center gap-3 group"
                                >
                                <div className="w-11 h-11 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg group-hover:bg-white/20 transition-colors duration-300 flex-shrink-0">
                                    <Mail className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Email</p>
                                    <p className="text-white font-medium group-hover:text-brand-light transition-colors duration-300">
                                        contact@avsd-drcongo.org
                                    </p>
                                </div>
                                </a>
                            </div>

                            {/* Adresse */}
                            <div className="border-t border-white/10 py-5">
                                <div className="flex items-start gap-3 group">
                                <div className="w-11 h-11 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg group-hover:bg-white/20 transition-colors duration-300 flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Adresse</p>
                                    <p className="text-white font-medium leading-relaxed">
                                        Immeuble Santiago, Av. Kindu II, Q. Mabanga Nord, Commune de Karisimbi, Ville de Goma, Nord-Kivu, RD.Congo. Non loin du Rondpoint Mutinga
                                    </p>
                                </div>
                                </div>
                            </div>

                            {/* Dernière bordure en bas */}
                            <div className="border-t border-white/10" />

                            </div>
                        </div>
                    </div>

                </div>
                </div>
            </section>
            </PageBanner>
        </>
    );
};

export default Contact;