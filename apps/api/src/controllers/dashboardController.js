// ===========================================
// CONTRÔLEUR DASHBOARD
// ===========================================

import Article from '../models/Article.js';
import Contact from '../models/Contact.js';
import Opportunity from '../models/Opportunity.js';
import Category from '../models/Category.js';
import ZoneIntervention from '../models/ZoneIntervention.js';
import MilieuIntervention from '../models/MilieuIntervention.js';
import Partner from '../models/Partner.js';
import Gallery from '../models/Gallery.js';

const getStats = async (req, res) => {
    try {
        const [
            articles,
            contacts,
            unreadContacts,
            opportunities,
            activeOpportunities,
            categories,
            zones,
            milieux,
            partners,
            gallery
        ] = await Promise.all([
            Article.countDocuments(),
            Contact.countDocuments(),
            Contact.countDocuments({ isRead: false }),
            Opportunity.countDocuments(),
            Opportunity.countDocuments({ 
                endDate: { $gte: new Date() },
                isActive: true 
            }),
            Category.countDocuments(),
            ZoneIntervention.countDocuments(),
            MilieuIntervention.countDocuments(),
            Partner.countDocuments(),
            Gallery.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                articles,
                contacts: {
                    total: contacts,
                    unread: unreadContacts
                },
                opportunities: {
                    total: opportunities,
                    active: activeOpportunities
                },
                categories,
                zones,
                milieux,
                partners,
                gallery
            }
        });
    } catch (error) {
        console.error('Erreur getStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getRecentContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.error('Erreur getRecentContacts:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getRecentArticles = async (req, res) => {
    try {
        const articles = await Article.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('category', 'name');
        
        res.status(200).json({ success: true, data: articles });
    } catch (error) {
        console.error('Erreur getRecentArticles:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getStats, getRecentContacts, getRecentArticles };