// ===========================================
// CONTRÔLEUR DES STATISTIQUES
// ===========================================

import Article from '../models/Article.js';
import Contact from '../models/Contact.js';
import Opportunity from '../models/Opportunity.js';
import Category from '../models/Category.js';
import Partner from '../models/Partner.js';
import Gallery from '../models/Gallery.js';
import Archive from '../models/Archive.js';

const getStats = async (req, res) => {
    try {
        const [
            totalArticles,
            totalContacts,
            unreadContacts,
            totalOpportunities,
            activeOpportunities,
            totalCategories,
            totalPartners,
            totalGallery,
            totalArchives
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
            Partner.countDocuments(),
            Gallery.countDocuments(),
            Archive.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                articles: totalArticles,
                contacts: {
                    total: totalContacts,
                    unread: unreadContacts
                },
                opportunities: {
                    total: totalOpportunities,
                    active: activeOpportunities
                },
                categories: totalCategories,
                partners: totalPartners,
                gallery: totalGallery,
                archives: totalArchives
            }
        });
    } catch (error) {
        console.error('Erreur getStats:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getMonthlyContacts = async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

        const contacts = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 
                           'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        const monthlyData = contacts.map(contact => ({
            month: monthNames[contact._id.month - 1],
            year: contact._id.year,
            count: contact.count
        }));

        res.status(200).json({ success: true, data: monthlyData });
    } catch (error) {
        console.error('Erreur getMonthlyContacts:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getArticlesByCategory = async (req, res) => {
    try {
        const articles = await Article.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $unwind: '$categoryInfo'
            },
            {
                $group: {
                    _id: '$categoryInfo.name',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const categoryData = articles.map(article => ({
            name: article._id,
            value: article.count
        }));

        res.status(200).json({ success: true, data: categoryData });
    } catch (error) {
        console.error('Erreur getArticlesByCategory:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

const getArchivesByYear = async (req, res) => {
    try {
        const archives = await Archive.aggregate([
            {
                $group: {
                    _id: { $year: '$publishedAt' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': -1 }
            }
        ]);

        const yearData = archives.map(archive => ({
            year: archive._id.toString(),
            count: archive.count
        }));

        res.status(200).json({ success: true, data: yearData });
    } catch (error) {
        console.error('Erreur getArchivesByYear:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

export { getStats, getMonthlyContacts, getArticlesByCategory, getArchivesByYear };