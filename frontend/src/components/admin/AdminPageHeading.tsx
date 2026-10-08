import React from 'react';

interface AdminPageHeadingProps {
    title: string;
    description: string;
    actions?: React.ReactNode; // buttons shown on the right
}

export const AdminPageHeading: React.FC<AdminPageHeadingProps> = ({ title, description, actions }) => (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-[#d4af37] to-transparent mt-2 mb-2" />
            <p className="text-neutral-600">{description}</p>
        </div>
        {/* On phones the buttons share one row, so they get tighter padding and never wrap their labels. */}
        {actions && (
            <div className="flex gap-3 [&>*]:whitespace-nowrap max-sm:[&>*]:flex-1 max-sm:[&>*]:!px-3 max-sm:[&>*]:!py-2.5 max-sm:[&>*]:!text-sm">
                {actions}
            </div>
        )}
    </div>
);
