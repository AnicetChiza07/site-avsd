import { Helmet } from 'react-helmet-async';
import defaultImage from '../assets/images/Logo/logo.png';

const SEO = ({ 
    title, 
    description, 
    keywords = 'AVSD RDC, association, développement, RDC, Congo, humanitaire, social',
    image,
    url = '' 
}) => {
    const siteUrl = 'https://site-avsd.vercel.app';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    
    // Utiliser l'image passée en prop ou l'image par défaut
    const fullImageUrl = image 
        ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
        : `${siteUrl}${defaultImage}`;

    return (
        <Helmet>
            {/* Balises de base */}
            <title>{title} | AVSD RDC</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={`${title} | AVSD RDC`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:site_name" content="AVSD RDC" />
            <meta property="og:locale" content="fr_FR" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={`${title} | AVSD RDC`} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />

            {/* Langue */}
            <html lang="fr" />
        </Helmet>
    );
};

export default SEO;