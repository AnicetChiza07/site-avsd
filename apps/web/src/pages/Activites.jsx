import PageBanner from '../components/layouts/PageBanner';
import SectionTitle from '../components/ui/SectionTitle';
import CTASection from '../components/sections/CTASection';
import PartnersSection from '../components/sections/PartnersSection';
import SEO from '../components/SEO';
import { Target, Handshake, Heart } from 'lucide-react';
import bgImage from '../assets/images/Caroussel/secondCarrous.jpg';

const Activites = () => {
    const activities = [
        {
            id: 1,
            number: "01",
            icon: Target,
            title: "Programme GPPD",
            content: "AVSD croit en la localisation de l'aide humanitaire au Congo. En collaboration avec les acteurs humanitaires, nous sensibilisons les femmes et les communautés à mettre à profit les recommandations du Sommet Humanitaire Mondial pour devenir moteurs du changement.",
            color: "bg-white",
            borderColor: "border-gray-100",
            textColor: "text-gray-900",
            pColor: "text-gray-600",
            iconBg: "bg-brand-blue/10",
            iconColor: "text-brand-blue",
            lineColor: "bg-brand-blue",
            separatorColor: "bg-gray-200",
            numberColor: "text-gray-400"
        },
        {
            id: 2,
            number: "02",
            icon: Handshake,
            title: "Plaidoyers & AGR",
            content: "Nous plaidons auprès des partenaires pour que les femmes et jeunes filles accèdent aux fonds de démarrage pour leurs Activités Génératrices de Revenus (AGR). Nous les accompagnons dans la gestion et les regroupons dans des Associations Villageoises d'Épargne et de Crédit (AVECs).",
            color: "bg-brand-blue",
            borderColor: "border-brand-blue",
            textColor: "text-white",
            pColor: "text-white/80",
            iconBg: "bg-white/20",
            iconColor: "text-white",
            lineColor: "bg-white",
            separatorColor: "bg-white/20",
            numberColor: "text-white/50"
        },
        {
            id: 3,
            number: "03",
            icon: Heart,
            title: "Auto-prise en charge",
            content: "Nous sensibilisons les femmes et jeunes filles à l'auto-prise en charge à travers des séances de réflexion sur le plein potentiel de chaque femme, pour son bien-être et celui de sa communauté tout entière.",
            color: "bg-white",
            borderColor: "border-gray-100",
            textColor: "text-gray-900",
            pColor: "text-gray-600",
            iconBg: "bg-brand-blue/10",
            iconColor: "text-brand-blue",
            lineColor: "bg-brand-blue",
            separatorColor: "bg-gray-200",
            numberColor: "text-gray-400"
        }
    ];

    return (
        <>
            {/* SEO Optimisé pour la page activités */}
            <SEO 
                title="Nos Activités"
                description="Découvrez les activités de l'AVSD RDC : Programme GPPD, plaidoyers pour les AGR, auto-prise en charge des femmes et développement communautaire au Nord-Kivu."
                keywords="activités AVSD, programme GPPD, AGR, plaidoyer, autonomisation femmes, développement communautaire, Nord-Kivu, RDC"
                url="/activites"
            />

            <PageBanner 
                title="Nos Activités" 
                subtitle="Les priorités de l'AVSD pour un changement durable dans la communauté."
                bgImage={bgImage}
                badge="Priorités"
                badgeIcon={Target}
            >
                <section className="py-16 sm:py-24">
                    <div className="container">
                        
                        <SectionTitle 
                            badge="Notre Action"
                            title="Activités de l'AVSD"
                            description="Les activités de l'AVSD sont issues de son principal programme phare : le Programme Genre, Perspective Paix et Développement (GPPD)."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 pb-16">
                        
                            {activities.map((activity) => (
                                <div 
                                    key={activity.id}
                                    className={`relative ${activity.color} border ${activity.borderColor} rounded-3xl p-8 min-h-[420px] flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group`}
                                >
                                    {/* En-tête : Icône à gauche, Numéro à droite */}
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={`w-12 h-12 ${activity.iconBg} rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                                            <activity.icon className={`w-6 h-6 ${activity.iconColor}`} strokeWidth={2} />
                                        </div>
                                        <span className={`text-sm font-medium ${activity.numberColor} select-none`}>
                                            {activity.number}
                                        </span>
                                    </div>

                                    {/* Ligne de séparation */}
                                    <div className={`w-full h-px ${activity.separatorColor} mb-6`} />

                                    {/* Contenu */}
                                    <h3 className={`text-2xl font-heading font-bold ${activity.textColor} mb-4`}>
                                        {activity.title}
                                    </h3>
                                    <p className={`text-base leading-relaxed flex-grow ${activity.pColor}`}>
                                        {activity.content}
                                    </p>

                                    {/* Ligne décorative animée en bas */}
                                    <div className={`w-12 h-1 ${activity.lineColor} mt-8 rounded-full transition-all duration-500 group-hover:w-full`} />
                                </div>
                            ))}

                        </div>
                    </div>
                </section>
            </PageBanner>

            <CTASection />
            <PartnersSection />
        </>
    );
};

export default Activites;