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
            color: "bg-brand-blue",
            textColor: "text-white",
            iconBg: "bg-brand-light",
            iconColor: "text-brand-blue",
            lineColor: "bg-white/20",
            numberColor: "text-white/30"
        },
        {
            id: 2,
            number: "02",
            icon: Handshake,
            title: "Plaidoyers & AGR",
            content: "Nous plaidons auprès des partenaires pour que les femmes et jeunes filles accèdent aux fonds de démarrage pour leurs Activités Génératrices de Revenus (AGR). Nous les accompagnons dans la gestion et les regroupons dans des Associations Villageoises d'Épargne et de Crédit (AVECs).",
            color: "bg-gray-100",
            textColor: "text-gray-900",
            iconBg: "bg-brand-blue",
            iconColor: "text-white",
            lineColor: "bg-gray-300",
            numberColor: "text-gray-400"
        },
        {
            id: 3,
            number: "03",
            icon: Heart,
            title: "Auto-prise en charge",
            content: "Nous sensibilisons les femmes et jeunes filles à l'auto-prise en charge à travers des séances de réflexion sur le plein potentiel de chaque femme, pour son bien-être et celui de sa communauté tout entière.",
            color: "bg-slate-800",
            textColor: "text-white",
            iconBg: "bg-white",
            iconColor: "text-slate-800",
            lineColor: "bg-white/20",
            numberColor: "text-white/30"
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

            {/* 2. PageBanner englobe la bannière et le contenu principal */}
            <PageBanner 
                title="Nos Activités" 
                subtitle="Les priorités de l'AVSD pour un changement durable dans la communauté."
                bgImage={bgImage}
                badge="Priorités"
                badgeIcon={Target}
            >
                <section data-theme="light" className="py-16 sm:py-24">
                    <div className="container">
                        
                        <SectionTitle 
                            badge="Activités"
                            title="Activités de l'AVSD"
                            description="Les activités de l'AVSD sont issues de son principal programme phare : le Programme Genre, Perspective Paix et Développement (GPPD)."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 pb-16">
                        
                        {activities.map((activity) => (
                            <div 
                                key={activity.id}
                                className={`relative ${activity.color} rounded-3xl p-8 min-h-[420px] flex flex-col overflow-visible group`}
                            >
                            {/* Icône en haut à droite */}
                            <div className={`absolute -top-6 -right-6 w-14 h-14 ${activity.iconBg} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <activity.icon className={`w-6 h-6 ${activity.iconColor}`} strokeWidth={2.5} />
                            </div>

                            {/* Contenu */}
                            <h3 className={`text-2xl font-heading ${activity.textColor} mb-4`}>
                                {activity.title}
                            </h3>
                            <p className={`text-base leading-relaxed flex-grow ${
                                activity.id === 2 ? 'text-gray-600' : 'text-white/80'
                            }`}>
                                {activity.content}
                            </p>

                            {/* Ligne de séparation en bas */}
                            <div className={`w-full h-px ${activity.lineColor} my-6`} />
                                {/* Numéro en bas à gauche */}
                                <div className={`${activity.numberColor} text-sm font-medium`}>
                                    {activity.number}
                                </div>
                            </div>
                        ))}

                        </div>
                    </div>
                </section>
            </PageBanner>

            {/* 3. CTASection placé juste après, pour qu'il prenne toute la largeur avec son fond sombre */}
            <CTASection />
            {/* 4. Partenaires */}
            <PartnersSection />
        </>
    );
};

export default Activites;