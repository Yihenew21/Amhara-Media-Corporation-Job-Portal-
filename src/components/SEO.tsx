import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

const defaultMeta = {
  title: 'JobFlow Amhara - Join Amhara Media Corporation',
  description: 'Discover exciting career opportunities at Amhara Media Corporation. Join Ethiopia\'s leading media organization and make a difference in our community.',
  keywords: 'amhara media corporation, jobs, careers, ethiopia, media, broadcasting, technology, journalism',
  image: '/og-image.png',
  url: 'https://jobs.amharamedia.com',
  type: 'website'
};

const SEO: React.FC<SEOProps> = ({ 
  title,
  description,
  keywords,
  image,
  url,
  type,
  noindex = false
}) => {
  const meta = {
    title: title ? `${title} - JobFlow Amhara` : defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: keywords || defaultMeta.keywords,
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type: type || defaultMeta.type
  };

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content="JobFlow Amhara" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      
      {/* Additional meta tags */}
      <meta name="author" content="Amhara Media Corporation" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={meta.url} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Amhara Media Corporation",
          "description": "Ethiopia's leading media organization",
          "url": "https://amharamedia.com",
          "logo": `${meta.url}/logo.png`,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+251-58-220-0456",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://facebook.com/amharamedia",
            "https://twitter.com/amharamedia",
            "https://linkedin.com/company/amhara-media"
          ],
          "jobPosting": {
            "@type": "JobPosting",
            "hiringOrganization": {
              "@type": "Organization",
              "name": "Amhara Media Corporation"
            }
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
