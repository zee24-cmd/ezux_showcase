import React, { useEffect } from 'react';

interface MetaTagsProps {
    title?: string;
    description?: string;
    keywords?: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({ title, description, keywords }) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | Ezux Showcase`;
        }

        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            } else {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                metaDescription.setAttribute('content', description);
                document.head.appendChild(metaDescription);
            }
        }

        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords);
            } else {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                metaKeywords.setAttribute('content', keywords);
                document.head.appendChild(metaKeywords);
            }
        }
    }, [title, description, keywords]);

    return null;
};
