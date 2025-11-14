
import React from 'react';

export const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 2v2" />
        <path d="M12 22v-2" />
        <path d="m17 7 1.4-1.4" />
        <path d="m6.4 18.4 1.4-1.4" />
        <path d="M22 12h-2" />
        <path d="M4 12H2" />
        <path d="m18.4 6.4-1.4 1.4" />
        <path d="m7 17-1.4 1.4" />
    </svg>
);
