import React from 'react';

interface AdminPageHeadingProps {
    title: string;
    description: string;
    actions?: React.ReactNode; // buttons shown on the right
}

export const AdminPageHeading: React.FC<AdminPageHeadingProps> = ({ title, description, actions }) => (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-[#d4af37] to-transparent mt-2 mb-2" />
            <p className="text-neutral-600">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
);
