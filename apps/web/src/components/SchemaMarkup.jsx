import { Helmet } from 'react-helmet-async';

const SchemaMarkup = ({ type, data }) => {
    let schema;

    // Schema pour les articles de blog
    if (type === 'article') {
        schema = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: data.title,
            description: data.excerpt || data.description,
            image: data.image,
            datePublished: data.publishedAt || data.createdAt,
            dateModified: data.updatedAt || data.publishedAt || data.createdAt,
            author: {
                '@type': 'Organization',
                name: 'AVSD RDC',
                url: 'https://site-avsd.vercel.app'
            },
            publisher: {
                '@type': 'Organization',
                name: 'AVSD RDC',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://site-avsd.vercel.app/logo.png'
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://site-avsd.vercel.app/actualites/${data.slug}`
            }
        };
    }

    // Schema pour l'organisation
    if (type === 'organization') {
        schema = {
            '@context': 'https://schema.org',
            '@type': 'NGO',
            name: 'AVSD RDC',
            alternateName: 'Action pour la Vulnérabilité et le Développement Durable',
            url: 'https://site-avsd.vercel.app',
            logo: 'https://site-avsd.vercel.app/logo.png',
            description: 'Association humanitaire œuvrant pour le développement communautaire, la paix et l\'autonomisation des femmes en RDC.',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'Immeuble Santiago, Av. Kindu II, Q. Mabanga Nord',
                addressLocality: 'Goma',
                addressRegion: 'Nord-Kivu',
                addressCountry: 'CD'
            },
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+243-999-107-243',
                contactType: 'customer service',
                email: 'contact@avsd-drcongo.org',
                availableLanguage: ['French']
            },
            sameAs: []
        };
    }

    // Schema pour les opportunités
    if (type === 'jobPosting') {
        schema = {
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: data.position || data.title,
            description: data.description,
            datePosted: data.createdAt,
            validThrough: data.endDate,
            employmentType: data.contractType || 'FULL_TIME',
            hiringOrganization: {
                '@type': 'Organization',
                name: 'AVSD RDC',
                sameAs: 'https://site-avsd.vercel.app',
                logo: 'https://site-avsd.vercel.app/logo.png'
            },
            jobLocation: {
                '@type': 'Place',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: data.location || 'Goma',
                    addressRegion: 'Nord-Kivu',
                    addressCountry: 'CD'
                }
            }
        };
    }

    if (!schema) return null;

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default SchemaMarkup;