import { Award, Users, MapPin, FolderCheck } from 'lucide-react';

/**
 * Données mockées des statistiques
 * 
 * Cette structure sera remplacée par un appel API (ex: axios.get('/api/stats'))
 * quand le backend sera prêt.
 */
export const statsData = [
    { 
        id: 1, 
        icon: Award, 
        value: 12, 
        suffix: '+', 
        label: "ANNÉES D'EXPÉRIENCE",
        description: "Au service des communautés depuis 2010"
    },
    { 
        id: 2, 
        icon: Users, 
        value: 5000, 
        suffix: '+', 
        label: "BÉNÉFICIAIRES AIDÉS",
        description: "Femmes, jeunes et enfants accompagnés"
    },
    { 
        id: 3, 
        icon: MapPin, 
        value: 3, 
        suffix: '', 
        label: "PROVINCES COUVERTES",
        description: "Nord-Kivu, Sud-Kivu et Ituri"
    },
    { 
        id: 4, 
        icon: FolderCheck, 
        value: 32, 
        suffix: '+', 
        label: "PROJETS RÉALISÉS",
        description: "Actions concrètes sur le terrain"
    },
];