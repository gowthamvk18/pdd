import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO = ({ 
  title = 'SkillSync | Trade skills, not money.', 
  description = 'Join the community of lifelong learners and teachers. Swap your skills and grow together without spending a dime.',
  image = 'https://skillsync-app.vercel.app/og-image.png',
  url = 'https://skillsync-app.vercel.app'
}: SEOProps) => {
  useEffect(() => {
    document.title = title;
    
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // OpenGraph
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', 'website', true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
  }, [title, description, image, url]);

  return null;
};
